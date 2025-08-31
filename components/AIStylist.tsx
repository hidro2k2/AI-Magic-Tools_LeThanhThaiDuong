import React, { useState, useCallback, useRef } from 'react';
import ToolHeader from './ToolHeader';
import ResultDisplay from './ResultDisplay';
import { generateStyledOutfit } from '../services/geminiService';
import Gallery from './Gallery';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface AIStylistProps {
  onBack: () => void;
  onOpenModal: (imageUrl: string) => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

interface StylistUploaderProps {
  title: React.ReactNode;
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  onRemoveImage: () => void;
}

const StylistUploader: React.FC<StylistUploaderProps> = ({ title, onImageUpload, imagePreviewUrl, onRemoveImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onRemoveImage();
  };

  return (
    <div>
      <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
      <div 
        className="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-pink-500 transition-all duration-300 cursor-pointer flex items-center justify-center relative group"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt={typeof title === 'string' ? title : 'Uploaded image'} className="w-full h-full object-cover rounded-lg" />
            <button 
              onClick={handleRemoveClick}
              className="absolute top-2 right-2 bg-red-600/80 p-2 rounded-full hover:bg-red-700 transition-colors duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={t('deleteImage')}
              title={t('deleteImage')}
            >
              <RemoveIcon />
            </button>
          </>
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('dragAndDrop')}</p>
          </div>
        )}
      </div>
    </div>
  );
};


const AIStylist: React.FC<AIStylistProps> = ({ onBack, onOpenModal }) => {
  const { t } = useLanguage();
  
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
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

  const handleModelUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setModelImage(imageData);
    } catch (err) {
      setError(t('errorCharacterUpload'));
      console.error(err);
    }
  }, [t]);

  const handleOutfitUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setOutfitImage(imageData);
    } catch (err) {
      setError(t('errorPropUpload'));
      console.error(err);
    }
  }, [t]);

  const handleGenerate = async () => {
    if (!modelImage || !outfitImage) {
      setError(t('errorBothImagesStylist'));
      return;
    }

    setError(null);
    setResultImage(null);

    const loadingMessages = [
        t('aiStylistLoading1'),
        t('aiStylistLoading2'),
        t('aiStylistLoading3'),
        t('aiStylistLoading4'),
        t('aiStylistLoading5'),
    ];
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);


    try {
      const generatedImageBase64 = await generateStyledOutfit(modelImage, outfitImage);
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

  const canGenerate = modelImage && outfitImage && !loadingMessage;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl">
        <ToolHeader onBack={onBack}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
            {t('aiStylistTitle')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('aiStylistInstructions')}
          </p>
        </ToolHeader>
        
        <main className="mt-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 flex flex-col gap-6 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6">
              <StylistUploader 
                title={t('modelPhoto')} 
                onImageUpload={handleModelUpload}
                imagePreviewUrl={modelImage ? `data:${modelImage.mimeType};base64,${modelImage.base64}` : null}
                onRemoveImage={() => setModelImage(null)}
              />
              <StylistUploader 
                title={t('outfitPhoto')}
                onImageUpload={handleOutfitUpload} 
                imagePreviewUrl={outfitImage ? `data:${outfitImage.mimeType};base64,${outfitImage.base64}` : null}
                onRemoveImage={() => setOutfitImage(null)}
              />
              <div className="text-center mt-auto pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ease-in-out
                    ${canGenerate 
                      ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-400 hover:to-orange-400 text-white transform hover:scale-105 shadow-lg shadow-orange-500/30' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {loadingMessage ? t('generating') : t('generateOutfitButton')}
                </button>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 min-h-[400px] lg:min-h-[600px]">
              <ResultDisplay 
                resultImage={resultImage}
                loadingMessage={loadingMessage}
                error={error}
                onOpenModal={onOpenModal}
                tool="stylist"
              />
            </div>
          </div>
          
          <Gallery images={galleryImages} onOpenModal={onOpenModal} onDeleteImage={handleDeleteImage} />
        </main>
      </div>
    </div>
  );
};

export default AIStylist;