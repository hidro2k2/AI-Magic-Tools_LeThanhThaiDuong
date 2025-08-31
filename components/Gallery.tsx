import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface GalleryProps {
  images: string[];
  onOpenModal: (imageUrl: string) => void;
  onDeleteImage: (index: number) => void;
}

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ExpandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
    </svg>
);

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const Gallery: React.FC<GalleryProps> = ({ images, onOpenModal, onDeleteImage }) => {
  const { t } = useLanguage();
  if (images.length === 0) {
    return null;
  }

  // Ensure only the 10 most recent images are shown
  const displayedImages = images.slice(0, 10);

  return (
    <div className="w-full mt-16">
      <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-300 mb-6">{t('galleryTitle')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
        {displayedImages.map((imageSrc, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img src={imageSrc} alt={`${t('generatedImageAlt')} ${index + 1}`} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <button
                onClick={() => onOpenModal(imageSrc)}
                className="bg-gray-800/80 p-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
                aria-label={t('viewLarger')}
                title={t('viewLarger')}
              >
                <ExpandIcon />
              </button>
              <a
                href={imageSrc}
                download={`generated-image-${Date.now()}-${index}.png`}
                className="bg-gray-800/80 p-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
                aria-label={t('downloadImage')}
                title={t('downloadImage')}
              >
                <DownloadIcon />
              </a>
              <button
                onClick={() => onDeleteImage(index)}
                className="bg-red-600/80 p-2 rounded-full hover:bg-red-700 transition-colors duration-300"
                aria-label={t('deleteImage')}
                title={t('deleteImage')}
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;