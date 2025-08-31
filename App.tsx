import React, { useState } from 'react';
import HomePage from './components/HomePage';
import PoseAnimator from './components/PoseAnimator';
import PropMaster from './components/PropMaster';
import ArtisticFusion from './components/ArtisticFusion';
import ImageGenerator from './components/ImageGenerator';
import AIStylist from './components/AIStylist';
import ImageModal from './components/ImageModal';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PasswordProtection from './components/PasswordProtection';

export type Tool = 'home' | 'pose' | 'prop' | 'fusion' | 'generator' | 'stylist';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('home');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOpenModal = (imageUrl: string) => {
    setModalImage(imageUrl);
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  const renderContent = () => {
    switch (activeTool) {
      case 'pose':
        return <PoseAnimator onBack={() => setActiveTool('home')} onOpenModal={handleOpenModal} />;
      case 'prop':
        return <PropMaster onBack={() => setActiveTool('home')} onOpenModal={handleOpenModal} />;
      case 'fusion':
        return <ArtisticFusion onBack={() => setActiveTool('home')} onOpenModal={handleOpenModal} />;
      case 'generator':
        return <ImageGenerator onBack={() => setActiveTool('home')} onOpenModal={handleOpenModal} />;
      case 'stylist':
        return <AIStylist onBack={() => setActiveTool('home')} onOpenModal={handleOpenModal} />;
      case 'home':
      default:
        return <HomePage onSelectTool={setActiveTool} />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-200 transition-colors duration-300">
          {!isAuthenticated ? (
            <PasswordProtection onSuccess={() => setIsAuthenticated(true)} />
          ) : (
            <>
              {renderContent()}
              {modalImage && <ImageModal imageUrl={modalImage} onClose={handleCloseModal} />}
            </>
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;