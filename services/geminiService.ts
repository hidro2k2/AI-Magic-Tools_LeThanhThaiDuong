import { GoogleGenAI, Modality } from "@google/genai";

interface ImageData {
  base64: string;
  mimeType: string;
}

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPromptForMode = (mode: string, backgroundOption: 'white' | 'original'): string => {
  const backgroundRule = backgroundOption === 'original'
    ? '2.  HẬU CẢNH: Giữ nguyên 100% hậu cảnh từ ảnh 1.'
    : '2.  HẬU CẢNH: Nền trắng trơn.';

  const baseInstruction = `Mục tiêu: Vẽ lại chủ thể (người hoặc động vật) từ ảnh 1 theo tư thế của ảnh 2.
QUY TẮC:
1.  NHẬN DẠNG: Giữ nguyên 100% nhận dạng, thiết kế, quần áo (nếu có), và màu sắc của chủ thể từ ảnh 1.
${backgroundRule}
3.  GIẢI PHẪU (QUAN TRỌNG NHẤT):
    a.  **CẤM TUYỆT ĐỐI** vẽ thừa hoặc thiếu bất kỳ bộ phận cơ thể nào (tay, chân, ngón tay, đuôi, tai, v.v.).
    b.  Nếu chủ thể là **ĐỘNG VẬT**, phải giữ nguyên 100% các đặc điểm giải phẫu đặc trưng của loài đó (số lượng chân, có đuôi hay không, hình dạng tai, hoa văn lông).
    c.  Tư thế mới phải được điều chỉnh để phù hợp với cấu trúc xương của chủ thể một cách **TỰ NHIÊN** và **HỢP LÝ**. Tránh các tư thế bị gãy, vặn vẹo phi thực tế.
4.  CẤM VĂN BẢN: Không thêm bất kỳ văn bản hay chi tiết thừa nào.
5.  ĐẦU RA: Chỉ trả về hình ảnh, không có văn bản.`;

  const creativeBackgroundRule = backgroundOption === 'original'
    ? '3. Hậu cảnh: Giữ lại và hòa trộn hậu cảnh từ ảnh 1 một cách nghệ thuật.'
    : '3. Hậu cảnh: Nền trắng trơn.';

  const creativePrompt = `Mục tiêu: Vẽ lại chủ thể từ ảnh 1 theo tư thế của ảnh 2 với phong cách sáng tạo.
QUY TẮC:
1.  Lấy cảm hứng từ chủ thể gốc và tư thế.
2.  Cho phép diễn giải nghệ thuật về trang phục và chi tiết, nhưng phải giữ được nhận diện cốt lõi của chủ thể.
${creativeBackgroundRule}
4.  GIẢI PHẪU (QUAN TRỌNG NHẤT):
    a.  **CẤM TUYỆT ĐỐI** vẽ thừa hoặc thiếu bất kỳ bộ phận cơ thể nào (tay, chân, ngón tay, đuôi, tai, v.v.).
    b.  Nếu chủ thể là **ĐỘNG VẬT**, phải giữ nguyên 100% các đặc điểm giải phẫu đặc trưng của loài đó (số lượng chân, có đuôi hay không, hình dạng tai, hoa văn lông).
    c.  Tư thế mới phải được điều chỉnh để phù hợp với cấu trúc xương của chủ thể một cách **TỰ NHIÊN** và **HỢP LÝ**.
5.  ĐẦU RA: Chỉ trả về hình ảnh, không có văn bản.`;


  switch (mode) {
    case 'canny':
      return `${baseInstruction}\n6. PHƯƠNG PHÁP: Dùng ảnh 2 làm bản đồ đường nét (canny edge map). Tuân thủ nghiêm ngặt các đường nét này khi vẽ lại tư thế.`;
    case 'depth':
      return `${baseInstruction}\n6. PHƯƠNG PHÁP: Dùng ảnh 2 làm bản đồ chiều sâu (depth map). Tái tạo chính xác phối cảnh và vị trí 3D của tư thế.`;
    case 'creative':
      return creativePrompt;
    case 'pose':
    default:
      return `${baseInstruction}\n6. TƯ THẾ: Áp dụng chính xác tư thế từ ảnh 2 cho chủ thể.`;
  }
};


export const generatePose = async (
  characterImage: ImageData,
  poseImage: ImageData,
  mode: string,
  backgroundOption: 'white' | 'original'
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const prompt = getPromptForMode(mode, backgroundOption);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: characterImage.base64,
              mimeType: characterImage.mimeType,
            },
          },
          {
            inlineData: {
              data: poseImage.base64,
              mimeType: poseImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }
    }
    
    if (response.text && response.text.trim()) {
        throw new Error(`API đã trả về một tin nhắn văn bản thay vì hình ảnh: ${response.text}`);
    }

    throw new Error("Không tìm thấy hình ảnh nào trong phản hồi từ API.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Lỗi khi gọi Gemini API: ${error.message}`);
    }
    throw new Error("Đã xảy ra lỗi không xác định khi tạo dáng.");
  }
};


export const generatePropImage = async (
  characterImage: ImageData,
  propImage: ImageData,
  userPrompt?: string,
  negativePrompt?: string
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    let prompt = `Mục tiêu: Thực hiện một ca "ghép đạo cụ kỹ thuật số" ở đẳng cấp chuyên nghiệp. Chỉnh sửa Ảnh 1 để nhân vật trong đó cầm hoặc tương tác một cách **siêu thực** với đạo cụ từ Ảnh 2. Kết quả cuối cùng phải trông giống như một bức ảnh được chụp tự nhiên, không có dấu vết của việc chỉnh sửa.

QUY TRÌNH BẮT BUỘC:

BƯỚC 1: PHÂN TÍCH
a.  **Nhân vật (Ảnh 1):** Phân tích tư thế, hướng ánh sáng chính, ánh sáng môi trường (ambient light), và tông màu tổng thể của ảnh.
b.  **Đạo cụ (Ảnh 2):** Xác định hình dạng, kích thước, và chất liệu của đạo cụ.

BƯỚC 2: TÍCH HỢP VÀ TƯƠNG TÁC (QUAN TRỌNG NHẤT)
a.  **Điều chỉnh Tư thế:** **VẼ LẠI** một cách tinh vi tư thế của nhân vật, đặc biệt là bàn tay, ngón tay, cánh tay và cơ thể, để tạo ra một hành động cầm, nắm, hoặc tương tác **hoàn toàn tự nhiên** và hợp lý với đạo cụ. Các ngón tay phải bao quanh đạo cụ một cách chính xác.
b.  **Vị trí Đạo cụ:** Đặt đạo cụ vào tay nhân vật với góc độ, tỷ lệ, và phối cảnh chính xác so với cơ thể và môi trường.

BƯỚC 3: HÒA HỢP ÁNH SÁNG VÀ BÓNG TỐI
a.  **Ánh sáng trên Đạo cụ:** Áp dụng lại **TOÀN BỘ** ánh sáng lên đạo cụ để nó khớp 100% với nguồn sáng và tông màu của Ảnh 1.
b.  **Bóng đổ:** Tạo ra các bóng đổ chân thực:
    - Bóng của đạo cụ đổ lên nhân vật (ví dụ: bóng của thanh kiếm trên cánh tay).
    - Bóng của các ngón tay đổ lên đạo cụ.

BƯỚC 4: HOÀN THIỆN & KIỂM TRA GIẢI PHẪU (CỰC KỲ QUAN TRỌNG)
a.  **Bảo toàn tuyệt đối:**
    - **Khuôn mặt & Đầu:** Giữ nguyên 100% cấu trúc, tỷ lệ, và đặc điểm khuôn mặt, đầu, tóc của nhân vật từ Ảnh 1. CẤM thay đổi hay làm biến dạng.
    - **Cơ thể:** Giữ nguyên 100% vóc dáng, tỷ lệ cơ thể của nhân vật.
    - **Trang phục:** Giữ nguyên phần trang phục không bị che khuất hoặc thay đổi do tương tác.
    - **Hậu cảnh:** Giữ nguyên 100% hậu cảnh từ Ảnh 1.
b.  **Kiểm tra giải phẫu nghiêm ngặt:**
    - **Đếm số lượng:** Đảm bảo nhân vật có ĐÚNG 2 tay, 2 chân, 1 đầu. Mỗi bàn tay có ĐÚNG 5 ngón.
    - **Tính toàn vẹn:** CẤM TUYỆT ĐỐI vẽ thừa, thiếu, hoặc làm biến dạng bất kỳ bộ phận cơ thể nào. Không có tay chân mọc ra từ vị trí vô lý.
    - **Tính tự nhiên:** Các khớp nối (khuỷu tay, đầu gối, cổ) phải ở vị trí tự nhiên, không bị gãy hay vặn vẹo.

QUY TẮC BỔ SUNG:
-   **ƯU TIÊN HÀNG ĐẦU:** Sự toàn vẹn về giải phẫu và nhận dạng của nhân vật gốc quan trọng hơn bất kỳ yếu tố nào khác. Nếu có xung đột, hãy ưu tiên giữ cho nhân vật trông đúng như trong Ảnh 1.
-   **Cấm Văn bản:** Không thêm bất kỳ văn bản nào.`;

    if (userPrompt && userPrompt.trim()) {
      prompt += `\n-   **YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG:** ${userPrompt.trim()}`;
    }
    if (negativePrompt && negativePrompt.trim()) {
      prompt += `\n-   **CÁC YẾU TỐ CẦN TRÁNH (NEGATIVE PROMPT):** ${negativePrompt.trim()}`;
    }
    
    prompt += `\n-   **Đầu ra:** Chỉ trả về hình ảnh đã chỉnh sửa, không có văn bản.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: characterImage.base64,
              mimeType: characterImage.mimeType,
            },
          },
          {
            inlineData: {
              data: propImage.base64,
              mimeType: propImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }
    }
    
    if (response.text && response.text.trim()) {
        throw new Error(`API đã trả về một tin nhắn văn bản thay vì hình ảnh: ${response.text}`);
    }

    throw new Error("Không tìm thấy hình ảnh nào trong phản hồi từ API.");

  } catch (error) {
    console.error("Error calling Gemini API for Prop Master:", error);
    if (error instanceof Error) {
        throw new Error(`Lỗi khi gọi Gemini API: ${error.message}`);
    }
    throw new Error("Đã xảy ra lỗi không xác định khi tạo ảnh.");
  }
};

const getStylePrompt = (style: string): string => {
    switch(style) {
        case 'original': return 'Maintain the original photographic style of both the subject and the background. The goal is a seamless, photorealistic composite, not an artistic interpretation. Do NOT apply any new artistic filter or stylization. The final output must look like a real, single photograph.';
        case 'anime': return 'Vibrant, high-contrast anime/manga style inspired by modern studios. Use crisp cel-shading, dynamic lines, and highly saturated colors. Eyes should be large and expressive. Include subtle light bloom and lens flare effects for dramatic moments. The overall feel should be energetic and polished.';
        case 'cinematic': return 'A cinematic, moody film still. Apply dramatic chiaroscuro lighting (strong contrast between light and dark). Use a shallow depth of field to draw focus. Grade the colors with a specific film LUT, like teal and orange or a desaturated, gritty look. Add subtle film grain and a widescreen letterbox effect.';
        case 'vintage': return 'Authentic 1970s vintage photograph look. Desaturate colors, apply a warm, yellowish tint (color cast). Add significant film grain and slight chromatic aberration. Introduce light leaks and soft vignetting around the edges. The focus should be slightly soft, mimicking old lenses.';
        case 'scifi': return 'Sleek, futuristic cyberpunk aesthetic. Dominated by neon and holographic lighting in shades of electric blue, magenta, and green. Surfaces should have metallic, reflective qualities. Incorporate complex geometric patterns and digital artifacts. The atmosphere should be dark, high-tech, and slightly dystopian.';
        case 'minimalist': return 'An ultra-clean, minimalist composition. Use a severely restricted color palette (two or three harmonious colors). Emphasize negative space. Forms should be simplified into essential geometric shapes. Lighting should be flat and even. The mood is calm, orderly, and serene.';
        case 'oilpainting': return 'A classical oil painting in the style of the old masters. Emphasize thick, visible impasto brushstrokes and rich textures. Use a warm, golden-hour light source to create soft shadows and a sense of depth. The color palette should be rich and earthy. The final image should have a tangible, canvas-like quality.';
        case 'travelvlog': return 'A bright, high-energy travel influencer photo style. Boost saturation and contrast for vibrant colors, especially blues and greens. Lighting should be bright and airy, as if shot on a sunny day. The composition should feel candid and aspirational. Aim for a sharp, clean, and professional look often seen on social media.';
        case 'fantasy': return 'Epic, high-fantasy digital painting. Use ethereal, god-ray lighting filtering through the scene. Incorporate magical elements like glowing particles, arcane symbols, or atmospheric mist. Details on clothing and environment should be intricate and ornate. The color palette should be otherworldly and dreamlike.';
        case 'horror': return 'A deeply unsettling psychological horror style. Use a desaturated color palette, dominated by deep shadows, sickly greens, and unsettling deep reds. Lighting should be harsh and unnatural, creating long, distorted shadows. Textures should be gritty and decayed (peeling paint, rust, grime). If a character is present, their expression should be one of subtle dread or uncanny valley, avoiding overt gore. The atmosphere should evoke a sense of creeping dread and unease, like a scene from a slow-burn horror film.';
        default: return 'A photorealistic style.';
    }
}

export const generateFusedImage = async (
  subjectImage: ImageData,
  backgroundImage: ImageData,
  style: string,
  userPrompt?: string,
  negativePrompt?: string
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const styleInstruction = getStylePrompt(style);

    let prompt = `Mục tiêu: Thực hiện một ca "ghép ảnh kỹ thuật số" ở đẳng cấp chuyên nghiệp, hoà trộn chủ thể từ Ảnh 1 vào bối cảnh của Ảnh 2, sau đó áp dụng một phong cách nghệ thuật lên toàn bộ tác phẩm. Kết quả cuối cùng phải trông giống một bức ảnh/tranh đơn lẻ, thống nhất, không có dấu vết của việc ghép ảnh.

QUY TRÌNH BẮT BUỘC:

BƯỚC 1: PHÂN TÍCH VÀ HÒA HỢP ÁNH SÁNG & MÀU SẮC (QUAN TRỌNG NHẤT)
a.  Phân tích bối cảnh (Ảnh 2): Xác định các nguồn sáng chính (hướng, cường độ, màu sắc - ví dụ: ánh sáng neon xanh, đèn đường vàng), ánh sáng môi trường (ambient light), và tông màu tổng thể.
b.  Tách chủ thể (Ảnh 1): Tách biệt chủ thể một cách sạch sẽ khỏi nền gốc.
c.  **Chỉnh màu & Ánh sáng Chủ thể:** Đây là bước quyết định. PHẢI điều chỉnh lại HOÀN TOÀN ánh sáng và màu sắc trên chủ thể để khớp với bối cảnh. Điều này bao gồm:
    - **Color Grading:** Áp dụng tông màu của bối cảnh lên chủ thể.
    - **Lighting:** Vẽ lại ánh sáng trên chủ thể sao cho khớp với các nguồn sáng đã xác định ở bước (a). Phải có các vùng sáng (highlights) và vùng tối (shadows) đúng hướng.
    - **Reflected Light:** Thêm ánh sáng phản chiếu từ môi trường lên chủ thể (ví dụ: ánh neon xanh hắt lên áo).
    - **Cast Shadows:** Tạo bóng đổ của chủ thể lên các bề mặt trong bối cảnh một cách chân thực.
d.  **Kết quả của Bước 1:** Một hình ảnh ghép thực tế, trong đó chủ thể đã hoàn toàn là một phần của bối cảnh về mặt ánh sáng và màu sắc.

BƯỚC 2: ÁP DỤNG PHONG CÁCH NGHỆ THUẬT
a.  **Tái tạo toàn cảnh:** Dựa trên kết quả đã hòa hợp ở Bước 1, VẼ LẠI TOÀN BỘ cảnh (cả chủ thể và bối cảnh) theo phong cách nghệ thuật chi tiết sau: ${styleInstruction}.
b.  **Đảm bảo sự thống nhất:** Phong cách nghệ thuật phải được áp dụng đồng đều trên toàn bộ tác phẩm, làm mờ ranh giới giữa chủ thể và bối cảnh, tạo ra một tổng thể hài hòa.

QUY TẮC BỔ SUNG:
-   **Giữ nhận dạng:** Dù qua các bước xử lý, khuôn mặt và các đặc điểm cốt lõi của chủ thể phải được giữ lại.
-   **Giải phẫu:** CẤM TUYỆT ĐỐI vẽ thừa/thêm các bộ phận cơ thể. Giải phẫu phải chính xác.
-   **Đầu ra:** Chỉ trả về hình ảnh cuối cùng.`;
    
    if (userPrompt && userPrompt.trim()) {
      prompt += `\n- YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${userPrompt.trim()}`;
    }
    if (negativePrompt && negativePrompt.trim()) {
      prompt += `\n- CÁC YẾU TỐ CẦN TRÁNH (NEGATIVE PROMPT): ${negativePrompt.trim()}`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: subjectImage.base64,
              mimeType: subjectImage.mimeType,
            },
          },
          {
            inlineData: {
              data: backgroundImage.base64,
              mimeType: backgroundImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }
    }
    
    if (response.text && response.text.trim()) {
        throw new Error(`API returned a text message instead of an image: ${response.text}`);
    }

    throw new Error("No image found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API for Artistic Fusion:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image fusion.");
  }
};

export const generateImageFromText = async (
  prompt: string,
  negativePrompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16'
): Promise<string | null> => {
  try {
    const model = 'imagen-4.0-generate-001';

    let finalPrompt = prompt.trim();
    if (negativePrompt && negativePrompt.trim()) {
      finalPrompt += ` | negative prompt: ${negativePrompt.trim()}`;
    }

    const response = await ai.models.generateImages({
        model: model,
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("No image found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API for Image Generator:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};

export const generateImageFromImageAndText = async (
  inputImage: ImageData,
  prompt: string,
  negativePrompt: string
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    let finalPrompt = `Mục tiêu: VẼ LẠI hình ảnh đầu vào một cách sáng tạo dựa trên yêu cầu của người dùng, biến nó thành một tác phẩm nghệ thuật mới.

QUY TRÌNH BẮT BUỘC:

BƯỚC 1: PHÂN TÍCH
a.  **Ảnh Gốc:** Phân tích các yếu tố cốt lõi của ảnh: chủ thể chính (người, vật, cảnh), bố cục, và cảm xúc chung.
b.  **Yêu cầu người dùng:** Phân tích kỹ prompt để hiểu rõ những thay đổi mong muốn về phong cách, bối cảnh, chi tiết, và không khí.

BƯỚC 2: TÁI TƯỞNG TƯỢNG VÀ VẼ LẠI (QUAN TRỌNG NHẤT)
a.  **Vẽ lại, không chỉ chỉnh sửa:** Dựa trên phân tích, VẼ LẠI TOÀN BỘ hình ảnh theo yêu cầu. Đây không phải là một bộ lọc (filter) hay chỉnh sửa nhỏ, mà là một quá trình tái tạo nghệ thuật.
b.  **Áp dụng thay đổi:** Tích hợp một cách sáng tạo các yếu tố từ prompt vào tác phẩm mới. Ví dụ: nếu prompt yêu cầu "phong cách cyberpunk", hãy biến đổi toàn bộ cảnh quan, quần áo, và ánh sáng theo chủ đề đó.
c.  **Bảo toàn nhận dạng (Nếu có người):** Nếu ảnh gốc có người, PHẢI giữ lại 100% các đặc điểm nhận dạng cốt lõi trên khuôn mặt (cấu trúc, tỷ lệ). Có thể thay đổi kiểu tóc, trang phục, và biểu cảm để phù hợp với phong cách mới, nhưng người đó vẫn phải được nhận ra.

BƯỚC 3: KIỂM TRA CHẤT LƯỢNG
a.  **Tính Thống nhất:** Đảm bảo toàn bộ hình ảnh (chủ thể và bối cảnh) có cùng một phong cách nghệ thuật, ánh sáng, và màu sắc thống nhất.
b.  **Giải phẫu:** CẤM TUYỆT ĐỐI vẽ thừa hoặc thiếu các bộ phận cơ thể. Giải phẫu phải chính xác và tự nhiên trong bối cảnh mới.

QUY TẮC BỔ SUNG:
-   **ƯU TIÊN HÀNG ĐẦU:** Sự sáng tạo và tuân thủ prompt của người dùng là quan trọng nhất. Hãy mạnh dạn thay đổi hình ảnh gốc.
-   **YÊU CẦU CỦA NGƯỜI DÙNG:** "${prompt.trim()}"`;

    if (negativePrompt && negativePrompt.trim()) {
      finalPrompt += `\n-   **CÁC YẾU TỐ CẦN TRÁNH (NEGATIVE PROMPT):** ${negativePrompt.trim()}`;
    }

    finalPrompt += `\n-   **Đầu ra:** Chỉ trả về hình ảnh đã được vẽ lại, không có văn bản.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: inputImage.base64,
              mimeType: inputImage.mimeType,
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return part.inlineData.data;
        }
      }
    }

    if (response.text && response.text.trim()) {
      throw new Error(`API returned a text message instead of an image: ${response.text}`);
    }

    throw new Error("No image found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API for Image-to-Image:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image-to-image generation.");
  }
};


export const generateStyledOutfit = async (
  modelImage: ImageData,
  outfitImage: ImageData
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const prompt = `Mục tiêu: Thực hiện một ca "thay đồ ảo". Thay thế HOÀN TOÀN MỘT PHẦN trang phục của người trong Ảnh 1 bằng món đồ trong Ảnh 2.

QUY TRÌNH BẮT BUỘC:

1.  **PHÂN TÍCH:**
    *   **Ảnh 1 (Người mẫu):** Xác định tất cả các món đồ người mẫu đang mặc (ví dụ: áo sơ mi xanh, quần đen).
    *   **Ảnh 2 (Trang phục):** Xác định chính xác món đồ là gì (ví dụ: một cái áo hoodie đỏ).

2.  **THỰC THI (QUAN TRỌNG NHẤT):**
    *   **XÁC ĐỊNH & XÓA BỎ:** Tìm món đồ trên người mẫu (Ảnh 1) tương ứng với món đồ trong Ảnh 2 (ví dụ: tìm cái áo sơ mi xanh). XÓA HOÀN TOÀN món đồ đó khỏi người mẫu.
    *   **VẼ LẠI:** Vẽ món đồ từ Ảnh 2 (áo hoodie đỏ) lên vị trí vừa bị xóa. Món đồ mới phải được mặc một cách tự nhiên, vừa vặn, tuân thủ đúng tư thế và vóc dáng của người mẫu. Tái tạo chính xác thiết kế, màu sắc, và chất liệu từ Ảnh 2.
    *   **CẤM TUYỆT ĐỐI:** Cấm chỉ lấy họa tiết, logo, hoặc chữ từ Ảnh 2 và dán lên trang phục gốc của Ảnh 1. Phải thay thế TOÀN BỘ món đồ.

3.  **BẢO TOÀN CÁC YẾU TỐ KHÁC:**
    *   **Người mẫu:** Giữ nguyên 100% khuôn mặt, tóc, da, tư thế, và vóc dáng.
    *   **Hậu cảnh:** Giữ nguyên 100% hậu cảnh từ Ảnh 1.
    *   **Trang phục còn lại:** GIỮ NGUYÊN HOÀN TOÀN các món đồ không bị thay thế. VÍ DỤ: Nếu thay áo, phải giữ nguyên quần.

4.  **CHẤT LƯỢNG & ĐỘ CHÂN THỰC:**
    *   Kết quả phải chân thực, liền mạch. Ánh sáng và bóng đổ trên trang phục mới phải khớp chính xác với môi trường ánh sáng của Ảnh 1.
    *   CẤM vẽ thừa hoặc thiếu các bộ phận cơ thể.

5.  **ĐẦU RA:**
    *   Giữ nguyên 100% tỷ lệ khung hình của Ảnh 1.
    *   Chỉ trả về hình ảnh. Cấm trả lời bằng văn bản.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { // Model Image
            inlineData: {
              data: modelImage.base64,
              mimeType: modelImage.mimeType,
            },
          },
          { // Outfit Image
            inlineData: {
              data: outfitImage.base64,
              mimeType: outfitImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }
    }
    
    if (response.text && response.text.trim()) {
        throw new Error(`API returned a text message instead of an image: ${response.text}`);
    }

    throw new Error("No image found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API for AI Stylist:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the virtual try-on.");
  }
};