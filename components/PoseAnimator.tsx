import React, { useState, useCallback } from 'react';
import ToolHeader from './ToolHeader';
import ImageUploader from './ImageUploader';
import ResultDisplay from './ResultDisplay';
import { generatePose } from '../services/geminiService';
import Gallery from './Gallery';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageData {
  base64: string;
  mimeType: string;
}

type ControlMode = 'pose' | 'canny' | 'depth' | 'creative';
type BackgroundOption = 'white' | 'original';

interface PoseAnimatorProps {
  onBack: () => void;
  onOpenModal: (imageUrl: string) => void;
}

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const PoseAnimator: React.FC<PoseAnimatorProps> = ({ onBack, onOpenModal }) => {
  const { t } = useLanguage();
  
  const controlModes = [
    { id: 'pose', name: t('controlModePose'), description: t('controlModePoseDesc') },
    { id: 'canny', name: t('controlModeCanny'), description: t('controlModeCannyDesc') },
    { id: 'depth', name: t('controlModeDepth'), description: t('controlModeDepthDesc') },
    { id: 'creative', name: t('controlModeCreative'), description: t('controlModeCreativeDesc') },
  ];

  const [characterImage, setCharacterImage] = useState<ImageData | null>(null);
  const [poseImage, setPoseImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>('pose');
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>('white');
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

  const handleCharacterUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setCharacterImage(imageData);
    } catch (err) {
      setError(t('errorCharacterUpload'));
      console.error(err);
    }
  }, [t]);

  const handlePoseUpload = useCallback(async (file: File) => {
    try {
      const imageData = await fileToImageData(file);
      setPoseImage(imageData);
    } catch (err) {
      setError(t('errorPoseUpload'));
      console.error(err);
    }
  }, [t]);

  const handleGenerate = async () => {
    if (!characterImage || !poseImage) {
      setError(t('errorBothImages'));
      return;
    }

    setError(null);
    setResultImage(null);

    const loadingMessages = [
        t('poseAnimatorLoading1'),
        t('poseAnimatorLoading2'),
        t('poseAnimatorLoading3'),
        t('poseAnimatorLoading4'),
        t('poseAnimatorLoading5'),
    ];
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
      const generatedImageBase64 = await generatePose(characterImage, poseImage, controlMode, backgroundOption);
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

  const canGenerate = characterImage && poseImage && !loadingMessage;

  const poseSketchTitle = (
    <div className="flex items-center justify-center gap-2">
      <span>{t('poseSketch')}</span>
      <a 
        href="https://www.posemaniacs.com" 
        target="_blank" 
        rel="noopener noreferrer"
        title={t('poseSuggestionTooltip')}
        className="text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        onClick={(e) => e.stopPropagation()}
        aria-label={t('poseSuggestionTooltip')}
      >
        <InfoIcon className="h-5 w-5" />
      </a>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl">
        <ToolHeader onBack={onBack}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
            {t('poseAnimatorTitle')}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('poseAnimatorInstructions')}
          </p>
        </ToolHeader>
        
        <main className="mt-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ImageUploader 
              title={t('characterImage')} 
              onImageUpload={handleCharacterUpload}
              imagePreviewUrl={characterImage ? `data:${characterImage.mimeType};base64,${characterImage.base64}` : null}
              onRemoveImage={() => setCharacterImage(null)}
            />
            <ImageUploader 
              title={poseSketchTitle}
              onImageUpload={handlePoseUpload} 
              imagePreviewUrl={poseImage ? `data:${poseImage.mimeType};base64,${poseImage.base64}` : null}
              onRemoveImage={() => setPoseImage(null)}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 min-h-[300px] md:min-h-[400px]">
            <ResultDisplay 
              resultImage={resultImage}
              loadingMessage={loadingMessage}
              error={error}
              onOpenModal={onOpenModal}
            />
          </div>
          
          <div className="text-center">
            <div className="mb-8 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">{t('controlMode')}</h3>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        {controlModes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setControlMode(mode.id as ControlMode)}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 border-2
                            ${controlMode === mode.id 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20' 
                                : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                            title={mode.description}
                        >
                            {mode.name}
                        </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">{t('backgroundOption')}</h3>
                     <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setBackgroundOption('white')}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 border-2
                            ${backgroundOption === 'white' 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20' 
                                : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                           {t('whiteBackground')}
                        </button>
                         <button
                            onClick={() => setBackgroundOption('original')}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-200 border-2
                            ${backgroundOption === 'original'
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20' 
                                : 'bg-gray-200 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                           {t('originalBackground')}
                        </button>
                    </div>
                </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ease-in-out
                ${canGenerate 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white transform hover:scale-105 shadow-lg shadow-indigo-600/30' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loadingMessage ? t('processing') : t('generatePoseButton')}
            </button>
          </div>

          <Gallery images={galleryImages} onOpenModal={onOpenModal} onDeleteImage={handleDeleteImage} />
        </main>
      </div>
    </div>
  );
};

export default PoseAnimator;