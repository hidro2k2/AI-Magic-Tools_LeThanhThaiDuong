import React, { useState, FormEvent } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PasswordProtectionProps {
  onSuccess: () => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const { t } = useLanguage();

  const correctPassword = '12/08/2002';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setError(null);
      onSuccess();
    } else {
      setError(t('passwordIncorrect'));
      setPassword('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`w-full max-w-md mx-auto p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${isShaking ? 'animate-shake' : ''}`}>
        <style>
          {`
            @keyframes shake {
              10%, 90% { transform: translate3d(-1px, 0, 0); }
              20%, 80% { transform: translate3d(2px, 0, 0); }
              30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
              40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            .animate-shake {
              animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
          `}
        </style>
        <div className="flex flex-col items-center">
            <LockIcon />
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">{t('passwordAccessRequired')}</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{t('passwordPrompt')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password-input" className="sr-only">{t('passwordPlaceholder')}</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-full transition-all duration-300 ease-in-out hover:bg-indigo-500 transform hover:scale-105 shadow-lg shadow-indigo-600/30 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            disabled={!password}
          >
            {t('passwordUnlock')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;