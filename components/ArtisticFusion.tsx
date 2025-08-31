import React, { useState, useCallback } from 'react';
import ToolHeader from './ToolHeader';
import ImageUploader from './ImageUploader';
import ResultDisplay from './ResultDisplay';
import { generateFusedImage } from '../services/geminiService';
import Gallery from './Gallery';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface ArtisticFusionProps {
  onBack: () => void;
  onOpenModal: (imageUrl: string) => void;
}

const ArtisticFusion: React.FC<ArtisticFusionProps> = ({ onBack, onOpenModal }) => {
  const { t } = useLanguage();
  
  const styles = [
    { id: 'original', name: t('style_original') },
    { id: 'anime', name: t('style_anime') },
    { id: 'cinematic', name: t('style_cinematic') },
    { id: 'vintage', name: t('style_vintage') },
    { id: 'scifi', name: t('style_scifi') },
    { id: 'minimalist', name: t('style_minimalist') },
    { id: 'oilpainting', name: t('style_oilpainting') },
    { id: 'travelvlog', name: t('style_travelvlog') },
    { id: 'fantasy', name: t('style_fantasy') },
    { id: 'horror', name: t('style_horror') },
  ];

  const [subjectImage, setSubjectImage] = useState<ImageData | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(styles[0].id);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
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

  const handleSubjectUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setSubjectImage(imageData);
    } catch (err) {
      setError(t('errorCharacterUpload'));
      console.error(err);
    }
  }, [t]);

  const handleBackgroundUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setBackgroundImage(imageData);
    } catch (err) {
      setError(t('errorPropUpload')); // Re-using a similar error message
      console.error(err);
    }
  }, [t]);

  const handleGenerate = async () => {
    if (!subjectImage || !backgroundImage) {
      setError(t('errorSubjectAndBackground'));
      return;
    }

    setError(null);
    setResultImage(null);

    const loadingMessages = [
        t('artisticFusionLoading1'),
        t('artisticFusionLoading2'),
        t('artisticFusionLoading3'),
        t('artisticFusionLoading4'),
        t('artisticFusionLoading5'),
    ];
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
      const generatedImageBase64 = await generateFusedImage(subjectImage, backgroundImage, selectedStyle, userPrompt, negativePrompt);
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

  const canGenerate = subjectImage && backgroundImage && !loadingMessage;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl">
        <ToolHeader onBack={onBack}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
            {t('artisticFusionTitle')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('artisticFusionInstructions')}
          </p>
        </ToolHeader>
        
        <main className="mt-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ImageUploader 
              title={t('subjectImage')} 
              onImageUpload={handleSubjectUpload}
              imagePreviewUrl={subjectImage ? `data:${subjectImage.mimeType};base64,${subjectImage.base64}` : null}
              onRemoveImage={() => setSubjectImage(null)}
            />
            <ImageUploader 
              title={t('backgroundImage')}
              onImageUpload={handleBackgroundUpload} 
              imagePreviewUrl={backgroundImage ? `data:${backgroundImage.mimeType};base64,${backgroundImage.base64}` : null}
              onRemoveImage={() => setBackgroundImage(null)}
            />
          </div>

           <div>
              <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-300 mb-4">{t('selectStyle')}</h3>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {styles.map((style) => (
                  <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-5 py-2.5 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 border-2
                      ${selectedStyle === style.id 
                          ? 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/20' 
                          : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                      {style.name}
                  </button>
                  ))}
              </div>
          </div>
          
          <div className="w-full max-w-3xl mx-auto space-y-6">
              <div>
                  <label htmlFor="user-prompt-fusion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('promptLabel')}
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">{t('promptHint')}</span>
                  </label>
                  <textarea
                      id="user-prompt-fusion"
                      rows={2}
                      className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                      placeholder={t('promptPlaceholder')}
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                  />
              </div>
              <div>
                  <label htmlFor="negative-prompt-fusion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('negativePromptLabel')}
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">{t('negativePromptHint')}</span>
                  </label>
                  <textarea
                      id="negative-prompt-fusion"
                      rows={2}
                      className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                      placeholder={t('negativePromptPlaceholder')}
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ease-in-out
                ${canGenerate 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white transform hover:scale-105 shadow-lg shadow-teal-600/30' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loadingMessage ? t('generating') : t('generateImageButton')}
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 min-h-[300px] md:min-h-[400px]">
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

export default ArtisticFusion;