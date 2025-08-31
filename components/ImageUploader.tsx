import React, { useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageUploaderProps {
  title: React.ReactNode;
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  onRemoveImage?: () => void;
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


const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, imagePreviewUrl, onRemoveImage }) => {
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
      onRemoveImage?.();
  };


  return (
    <div 
      className="w-full h-full min-h-[300px] md:min-h-[400px] flex-1 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
      <div className="flex-1 flex items-center justify-center relative group">
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt={typeof title === 'string' ? title : 'Uploaded image'} className="w-full h-full object-contain rounded-lg" />
            {onRemoveImage && (
                <button 
                    onClick={handleRemoveClick}
                    className="absolute top-2 right-2 bg-red-600/80 p-2 rounded-full hover:bg-red-700 transition-colors duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={t('deleteImage')}
                    title={t('deleteImage')}
                >
                    <RemoveIcon />
                </button>
            )}
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

export default ImageUploader;