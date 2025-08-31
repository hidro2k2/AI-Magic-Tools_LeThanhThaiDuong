import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../services/translations';

const languages: { code: Language; name: string }[] = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

const FlagIcon: React.FC<{ code: Language; size?: number }> = ({ code, size = 36 }) => {
    const wrapperStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `calc(${size}px * 0.05) solid rgba(255, 255, 255, 0.3)`,
        boxShadow: `inset 0 calc(${size}px * 0.05) calc(${size}px * 0.1) rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#ccc'
    };

    switch (code) {
        case 'vi':
            return (
                <div style={{ ...wrapperStyle, backgroundColor: '#DA251D' }}>
                    <span style={{ color: '#FFFF00', fontSize: `calc(${size}px * 0.5)`, lineHeight: 1, textShadow: '0 0 2px black' }}>★</span>
                </div>
            );
        case 'en':
            return (
                <div style={wrapperStyle}>
                    <svg width={size} height={size} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <rect width="36" height="36" fill="#FFFFFF"/>
                        <path fill="#B22234" d="M0 3 h36 v3 H0z M0 9 h36 v3 H0z M0 15 h36 v3 H0z M0 21 h36 v3 H0z M0 27 h36 v3 H0z M0 33 h36 v3 H0z"/>
                        <rect width="18" height="21" fill="#3C3B6E"/>
                        <g fill="#FFFFFF">
                            <polygon points="4,4.2 4.8,6.7 2.8,5.2 6.2,5.2 4,6.7" />
                            <polygon points="12,4.2 12.8,6.7 10.8,5.2 14.2,5.2 12,6.7" />
                            <polygon points="8,8.2 8.8,10.7 6.8,9.2 10.2,9.2 8,10.7" />
                            <polygon points="4,12.2 4.8,14.7 2.8,13.2 6.2,13.2 4,14.7" />
                            <polygon points="12,12.2 12.8,14.7 10.8,13.2 14.2,13.2 12,14.7" />
                            <polygon points="8,16.2 8.8,18.7 6.8,17.2 10.2,17.2 8,18.7" />
                        </g>
                    </svg>
                </div>
            );
        case 'zh':
             return (
                <div style={{ ...wrapperStyle, backgroundColor: '#EE1C25' }}>
                     <span style={{ color: '#FFFF00', position: 'absolute', top: '20%', left: '20%', fontSize: `calc(${size}px * 0.4)`, textShadow: '0 0 2px black'}}>★</span>
                     <span style={{ color: '#FFFF00', position: 'absolute', top: '10%', right: '25%', fontSize: `calc(${size}px * 0.15)`, transform: 'rotate(20deg)', textShadow: '0 0 2px black'}}>★</span>
                     <span style={{ color: '#FFFF00', position: 'absolute', top: '25%', right: '15%', fontSize: `calc(${size}px * 0.15)`, transform: 'rotate(45deg)', textShadow: '0 0 2px black'}}>★</span>
                     <span style={{ color: '#FFFF00', position: 'absolute', top: '45%', right: '15%', fontSize: `calc(${size}px * 0.15)`, transform: 'rotate(70deg)', textShadow: '0 0 2px black'}}>★</span>
                     <span style={{ color: '#FFFF00', position: 'absolute', top: '60%', right: '25%', fontSize: `calc(${size}px * 0.15)`, transform: 'rotate(90deg)', textShadow: '0 0 2px black'}}>★</span>
                </div>
            );
        default:
            return <div style={wrapperStyle}>?</div>;
    }
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform transform hover:scale-110"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <FlagIcon code={currentLanguage.code} size={40} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <ul className="p-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    language === lang.code
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FlagIcon code={lang.code} size={24} />
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;