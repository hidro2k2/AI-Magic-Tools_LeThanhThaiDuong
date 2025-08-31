import React from 'react';
import { Tool } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

interface HomePageProps {
  onSelectTool: (tool: Tool) => void;
}

const ToolCard: React.FC<{title: string; description: string; onClick: () => void; gradient: string}> = ({title, description, onClick, gradient}) => (
    <div 
        onClick={onClick}
        className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all duration-300 cursor-pointer flex flex-col items-center text-center transform hover:-translate-y-1 h-full"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
        <h2 className={`text-3xl font-bold text-transparent bg-clip-text ${gradient}`}>{title}</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
    </div>
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


const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
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
      <header className="text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
          {t('homeTitle')}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          {t('homeSubtitle')}
        </p>
      </header>
      <main className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ToolCard 
            title={t('poseAnimatorTitle')}
            description={t('poseAnimatorDescription')}
            onClick={() => onSelectTool('pose')}
            gradient="bg-gradient-to-r from-purple-400 to-cyan-400"
        />
        <ToolCard 
            title={t('propMasterTitle')}
            description={t('propMasterDescription')}
            onClick={() => onSelectTool('prop')}
            gradient="bg-gradient-to-r from-orange-400 to-rose-400"
        />
         <ToolCard 
            title={t('artisticFusionTitle')}
            description={t('artisticFusionDescription')}
            onClick={() => onSelectTool('fusion')}
            gradient="bg-gradient-to-r from-teal-400 to-green-400"
        />
         <ToolCard 
            title={t('imageGeneratorTitle')}
            description={t('imageGeneratorDescription')}
            onClick={() => onSelectTool('generator')}
            gradient="bg-gradient-to-r from-blue-400 to-purple-400"
        />
        <ToolCard 
            title={t('aiStylistTitle')}
            description={t('aiStylistDescription')}
            onClick={() => onSelectTool('stylist')}
            gradient="bg-gradient-to-r from-pink-400 to-orange-400"
        />
      </main>
      <footer className="mt-16 w-full max-w-5xl text-center">
        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-6">
            <p className="text-base text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            {t('copyrightText')}{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Design24</span> x <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Duong</span>
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Để trao đổi hợp tác hoặc mua bản quyền đầy đủ, vui lòng liên hệ Zalo: 034252825
            </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;