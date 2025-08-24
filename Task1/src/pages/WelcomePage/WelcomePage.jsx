import React, { useState, useEffect } from 'react';
import { HiFaceSmile } from 'react-icons/hi2';
import './WelcomePage.css';

/**
 * Welcome Page Component
 * Displays a simple animated welcome screen with smile icon and ripple effects
 */
const WelcomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-page">
      {/* Main content */}
      <div className="welcome-page__content">
        {/* Main smile icon with ripple effects */}
        <div className={`welcome-page__icon-container ${isVisible ? 'welcome-page__icon-container--visible' : ''}`}>
          {/* Ripple effects */}
          <div className="welcome-page__ripple welcome-page__ripple--1"></div>
          <div className="welcome-page__ripple welcome-page__ripple--2"></div>
          <div className="welcome-page__ripple welcome-page__ripple--3"></div>

          {/* Main smile icon */}
          <div className="welcome-page__main-icon">
            <HiFaceSmile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;