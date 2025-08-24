import React from 'react';
import { HiHome, HiChartBar, HiSparkles } from 'react-icons/hi';
import { FaGasPump } from 'react-icons/fa';
import './Navigation.css';

/**
 * Simple Navigation Component
 * @param {Object} props
 * @param {string} props.currentPage - Current active page
 * @param {Function} props.onPageChange - Page change handler
 */
const Navigation = ({ currentPage, onPageChange }) => {
  const pages = [
    { id: 'home', label: 'Trang chủ', icon: HiHome },
    { id: 'transactions', label: 'Phân tích dữ liệu', icon: HiChartBar }
  ];

  return (
    <nav className="navigation">
      <div className="navigation__brand">
        <span className="navigation__brand-icon">
          <FaGasPump className="brand-icon" />
        </span>
        <span className="navigation__brand-text">
          SHub
        </span>
      </div>

      <div className="navigation__menu">
        {pages.map(page => {
          const IconComponent = page.icon;
          return (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`navigation__item ${currentPage === page.id ? 'navigation__item--active' : ''
                }`}
            >
              <span className="navigation__item-icon">
                <IconComponent />
              </span>
              <span className="navigation__item-text">{page.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;