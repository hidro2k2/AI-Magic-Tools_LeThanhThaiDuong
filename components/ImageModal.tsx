import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const { t } = useLanguage();
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
        aria-label={t('close')}
        title={t('close')}
      >
        <CloseIcon />
      </button>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt={t('enlargedViewAlt')}
          className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageModal;
