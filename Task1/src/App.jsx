import React, { useState } from 'react';
import { useWelcomeScreen } from './hooks';
import { AppLayout, Navigation } from './components/layout';
import { WelcomePage, HomePage, TransactionPage } from './pages';
import { TransactionProvider } from './context';
import './App.css';

/**
 * Main Application Component
 * Manages the application state and routing
 */
function App() {
  const showWelcome = useWelcomeScreen();
  const [currentPage, setCurrentPage] = useState('home');

  if (showWelcome) {
    return <WelcomePage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'transactions':
        return <TransactionPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <TransactionProvider>
      <AppLayout>
        {currentPage !== 'home' && (
          <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {renderCurrentPage()}
      </AppLayout>
    </TransactionProvider>
  );
}

export default App
