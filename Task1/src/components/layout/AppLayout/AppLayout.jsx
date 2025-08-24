import React from 'react';
import './AppLayout.css';

/**
 * Main Application Layout Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <main className="app-layout__main">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
