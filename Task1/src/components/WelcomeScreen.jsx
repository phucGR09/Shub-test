import React from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">Chào mừng</h1>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
