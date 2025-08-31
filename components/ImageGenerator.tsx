import React, { useState, useCallback } from 'react';
import ToolHeader from './ToolHeader';
import ResultDisplay from './ResultDisplay';
import { generateImageFromText, generateImageFromImageAndText } from '../services/geminiService';
import Gallery from './Gallery';
import { useLanguage } from '../contexts/LanguageContext';
import ImageUploader from './ImageUploader';

type AspectRatio = '1:1' | '16:9' | '9:16';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface ImageGeneratorProps {
  onBack: () => void;
  onOpenModal: (imageUrl: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack, onOpenModal }) => {
  const { t } = useLanguage();

  const aspectRatios: { id: AspectRatio, name: string }[] = [
    { id: '1:1', name: '1 : 1' },
    { id: '16:9', name: '16 : 9' },
    { id: '9:16', name: '9 : 16' },
  ];

  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [inputImage, setInputImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve({ base64, mimeType: file.type });
        } else {
          reject(new Error('Failed to read file as base64 string.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setInputImage(imageData);
    } catch (err) {
      setError(t('errorPropUpload'));
      console.error(err);
    }
  }, [t]);

  const handleRemoveInputImage = () => {
    setInputImage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(t('errorPromptEmpty'));
      return;
    }

    setError(null);
    setResultImage(null);

    const loadingMessages = [
        t('imageGeneratorLoading1'),
        t('imageGeneratorLoading2'),
        t('imageGeneratorLoading3'),
        t('imageGeneratorLoading4'),
        t('imageGeneratorLoading5'),
    ];
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
      let generatedImageBase64: string | null = null;
      if (inputImage) {
        generatedImageBase64 = await generateImageFromImageAndText(inputImage, prompt, negativePrompt);
      } else {
        generatedImageBase64 = await generateImageFromText(prompt, negativePrompt, aspectRatio);
      }

      if (generatedImageBase64) {
        const imageUrl = `data:image/png;base64,${generatedImageBase64}`;
        setResultImage(imageUrl);
        setGalleryImages(prevImages => [imageUrl, ...prevImages].slice(0, 10));
      } else {
        throw new Error(t('errorAIFailedToGenerate'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorUnknown');
      setError(`${t('errorPrefix')}: ${errorMessage}`);
      console.error(err);
    } finally {
      clearInterval(intervalId);
      setLoadingMessage(null);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setGalleryImages(prevImages => prevImages.filter((_, index) => index !== indexToDelete));
  };

  const canGenerate = prompt.trim() && !loadingMessage;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl">
        <ToolHeader onBack={onBack}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {t('imageGeneratorTitle')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('imageGeneratorInstructions')}
          </p>
        </ToolHeader>
        
        <main className="mt-8 flex flex-col gap-8">
           <div className="w-full max-w-md mx-auto">
            <ImageUploader 
              title={t('inputImageTitle')}
              onImageUpload={handleImageUpload}
              imagePreviewUrl={inputImage ? `data:${inputImage.mimeType};base64,${inputImage.base64}` : null}
              onRemoveImage={handleRemoveInputImage}
            />
          </div>

          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div>
                <label htmlFor="prompt-generator" className="block text-lg font-medium text-gray-800 dark:text-gray-300 mb-2">
                    {t('promptLabel')}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">{t('promptHint')}</span>
                </label>
                <textarea
                    id="prompt-generator"
                    rows={4}
                    className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder={t('promptPlaceholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="negative-prompt-generator" className="block text-lg font-medium text-gray-800 dark:text-gray-300 mb-2">
                    {t('negativePromptLabel')}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">{t('negativePromptHint')}</span>
                </label>
                <textarea
                    id="negative-prompt-generator"
                    rows={2}
                    className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder={t('negativePromptPlaceholder')}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                />
            </div>

            <div>
              <h3 className={`text-lg font-semibold text-center mb-3 transition-colors ${!!inputImage ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-300'}`}>{t('aspectRatio')}</h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {aspectRatios.map((ratio) => (
                  <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      disabled={!!inputImage}
                      className={`px-6 py-2.5 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 border-2
                      ${aspectRatio === ratio.id && !inputImage
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20' 
                          : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }
                      ${!!inputImage
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                      {ratio.name}
                  </button>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ease-in-out
                ${canGenerate 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white transform hover:scale-105 shadow-lg shadow-purple-600/30' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loadingMessage ? t('generating') : t('generateImageButton')}
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 min-h-[300px] md:min-h-[400px] max-w-3xl mx-auto w-full">
            <ResultDisplay 
              resultImage={resultImage}
              loadingMessage={loadingMessage}
              error={error}
              onOpenModal={onOpenModal}
            />
          </div>

          <Gallery images={galleryImages} onOpenModal={onOpenModal} onDeleteImage={handleDeleteImage} />
        </main>
      </div>
    </div>
  );
};

export default ImageGenerator;