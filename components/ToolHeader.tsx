import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeSwitcher from './ThemeSwitcher';

interface ToolHeaderProps {
  onBack: () => void;
  children: React.ReactNode;
}

const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const FacebookIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6"
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" />
    </svg>
);

const ToolHeader: React.FC<ToolHeaderProps> = ({ onBack, children }) => {
  const { t } = useLanguage();
  return (
    <header className="text-center relative py-4">
        <button 
            onClick={onBack} 
            className="absolute top-1/2 left-0 sm:left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50 z-10"
            aria-label={t('goBack')}
            title={t('goBack')}
        >
            <BackIcon />
        </button>
        <div className="absolute top-1/2 right-0 sm:right-4 -translate-y-1/2 z-10 flex items-center gap-2">
            <a
                href="https://www.facebook.com/thaiduong120802"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-110"
                aria-label="Facebook Profile"
                title="Facebook Profile"
            >
                <FacebookIcon />
            </a>
            <ThemeSwitcher />
            <LanguageSwitcher />
        </div>
        {children}
    </header>
  );
};

export default ToolHeader;