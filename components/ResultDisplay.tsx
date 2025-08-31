import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultDisplayProps {
  resultImage: string | null;
  loadingMessage: string | null;
  error: string | null;
  onOpenModal: (imageUrl: string) => void;
  tool?: 'stylist' | 'default';
}

const Spinner: React.FC = () => (
  <svg className="animate-spin h-10 w-10 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const SparklesIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l-1.293-1.293a1 1 0 010-1.414L14 7m5 5l2.293 2.293a1 1 0 010 1.414L19 19l-1.293-1.293a1 1 0 010-1.414L20 14m-3-3l-2.293 2.293a1 1 0 01-1.414 0L12 11.707l1.293-1.293a1 1 0 011.414 0L17 11z" />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ExpandIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
  </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImage, loadingMessage, error, onOpenModal, tool = 'default' }) => {
  const { t } = useLanguage();

  if (loadingMessage) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-red-500 dark:text-red-400">{t('errorOccurred')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{error}</p>
      </div>
    );
  }

  if (resultImage) {
    return (
      <div className="relative w-full h-full group">
        <img src={resultImage} alt={t('generatedPoseAlt')} className="w-full h-full object-contain rounded-lg" />
        <div className="absolute top-4 right-4 flex flex-col gap-3">
            <button
                onClick={() => onOpenModal(resultImage)}
                className="bg-gray-900/70 text-white p-3 rounded-full hover:bg-indigo-600 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={t('viewLarger')}
                title={t('viewLarger')}
                >
                <ExpandIcon />
            </button>
            <a
            href={resultImage}
            download="posed_character.png"
            className="bg-gray-900/70 text-white p-3 rounded-full hover:bg-indigo-600 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={t('downloadImage')}
            title={t('downloadImage')}
            >
            <DownloadIcon />
            </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <SparklesIcon />
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{t('resultInitialTitle')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tool === 'stylist' ? t('resultInitialSubtitleStylist') : t('resultInitialSubtitle')}
      </p>
    </div>
  );
};

export default ResultDisplay;