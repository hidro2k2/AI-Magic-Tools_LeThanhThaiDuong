import React, { useState, useCallback, useRef } from 'react';
import ToolHeader from './ToolHeader';
import ResultDisplay from './ResultDisplay';
import { generatePropImage } from '../services/geminiService';
import Gallery from './Gallery';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface PolaroidUploaderProps {
  title: string;
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  hoverRotation: 'left' | 'right';
  uploadText: string;
  onRemoveImage?: () => void;
}

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const PolaroidUploader: React.FC<PolaroidUploaderProps> = ({ title, onImageUpload, imagePreviewUrl, hoverRotation, uploadText, onRemoveImage }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };
    const handleClick = () => inputRef.current?.click();
    const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    }, [onImageUpload]);

    const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onRemoveImage?.();
    };

    const rotationClass = hoverRotation === 'left' ? 'hover:-rotate-2' : 'hover:rotate-2';

    return (
        <div className="flex flex-col items-center gap-4 group">
            <div
                className={`bg-white p-3 pb-4 shadow-lg dark:shadow-2xl dark:shadow-black/20 w-full max-w-sm aspect-[4/5] relative cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/20 dark:hover:shadow-rose-500/20 ${rotationClass}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            >
                <div className="bg-black w-full h-full flex items-center justify-center relative">
                    {imagePreviewUrl ? (
                         <>
                            <img src={imagePreviewUrl} alt={title} className="w-full h-full object-cover" />
                             {onRemoveImage && (
                                <button 
                                    onClick={handleRemoveClick}
                                    className="absolute top-2 right-2 bg-red-600/80 p-2 rounded-full hover:bg-red-700 transition-colors duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                                    aria-label={t('deleteImage')}
                                    title={t('deleteImage')}
                                >
                                    <RemoveIcon />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="mt-2 font-sans">{uploadText}</p>
                        </div>
                    )}
                </div>
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-300 tracking-wider mt-2 transition-colors duration-300 group-hover:text-rose-500 dark:group-hover:text-rose-300">{title}</p>
            <input type="file" ref={inputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
    );
};


interface PropMasterProps {
  onBack: () => void;
  onOpenModal: (imageUrl: string) => void;
}

const PropMaster: React.FC<PropMasterProps> = ({ onBack, onOpenModal }) => {
    const { t } = useLanguage();
    const [characterImage, setCharacterImage] = useState<ImageData | null>(null);
    const [propImage, setPropImage] = useState<ImageData | null>(null);
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

    const handleCharacterUpload = useCallback(async (file: File) => {
        try {
            const imageData = await fileToImageData(file);
            setCharacterImage(imageData);
        } catch (err) {
            setError(t('errorCharacterUpload'));
            console.error(err);
        }
    }, [t]);

    const handlePropUpload = useCallback(async (file: File) => {
        try {
            const imageData = await fileToImageData(file);
            setPropImage(imageData);
        } catch (err) {
            setError(t('errorPropUpload'));
            console.error(err);
        }
    }, [t]);

    const handleGenerate = async () => {
        if (!characterImage || !propImage) {
            setError(t('errorBothImagesProp'));
            return;
        }

        setError(null);
        setResultImage(null);

        const loadingMessages = [
            t('propMasterLoading1'),
            t('propMasterLoading2'),
            t('propMasterLoading3'),
            t('propMasterLoading4'),
            t('propMasterLoading5'),
        ];
        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2500);

        try {
        const generatedImageBase64 = await generatePropImage(characterImage, propImage, userPrompt, negativePrompt);
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

    const canGenerate = characterImage && propImage && !loadingMessage;

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-6xl">
                <ToolHeader onBack={onBack}>
                    <div style={{ fontFamily: "'Playfair Display', serif" }}>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 dark:text-white tracking-wide">
                           {t('propMasterTitle')}
                        </h1>
                        <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                           {t('propMasterTagline')}
                        </p>
                    </div>
                </ToolHeader>

                <main className="mt-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
                        <PolaroidUploader 
                            title={t('uploadCharacter')} 
                            onImageUpload={handleCharacterUpload} 
                            imagePreviewUrl={characterImage ? `data:${characterImage.mimeType};base64,${characterImage.base64}` : null}
                            hoverRotation="left"
                            uploadText={t('uploadPhoto')}
                            onRemoveImage={() => setCharacterImage(null)}
                        />
                        <PolaroidUploader 
                            title={t('uploadProp')}
                            onImageUpload={handlePropUpload}
                            imagePreviewUrl={propImage ? `data:${propImage.mimeType};base64,${propImage.base64}` : null}
                            hoverRotation="right"
                            uploadText={t('uploadPhoto')}
                            onRemoveImage={() => setPropImage(null)}
                        />
                     </div>
                     
                     <div className="mt-12 w-full max-w-3xl mx-auto space-y-6">
                        <div>
                            <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('promptLabel')}
                                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">{t('promptHint')}</span>
                            </label>
                            <textarea
                                id="user-prompt"
                                rows={2}
                                className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors duration-200"
                                placeholder={t('promptPlaceholder')}
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('negativePromptLabel')}
                                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">{t('negativePromptHint')}</span>
                            </label>
                            <textarea
                                id="negative-prompt"
                                rows={2}
                                className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors duration-200"
                                placeholder={t('negativePromptPlaceholder')}
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                            />
                        </div>
                    </div>

                     <div className="mt-12 flex flex-col items-center">
                         <button
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                            className={`px-10 py-4 text-xl font-bold rounded-full transition-all duration-300 ease-in-out text-white
                                ${canGenerate 
                                ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 transform hover:scale-105 shadow-lg shadow-rose-500/30' 
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                            {loadingMessage ? t('generating') : t('generateImageButton')}
                         </button>
                     </div>

                     <div className="mt-12 w-full max-w-3xl mx-auto min-h-[300px] flex items-center justify-center">
                        <ResultDisplay resultImage={resultImage} loadingMessage={loadingMessage} error={error} onOpenModal={onOpenModal} />
                     </div>
                     <Gallery images={galleryImages} onOpenModal={onOpenModal} onDeleteImage={handleDeleteImage} />
                </main>
            </div>
        </div>
    );
};

export default PropMaster;