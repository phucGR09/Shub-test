import React, { useEffect, useState } from 'react';
import './Toast.css';

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of toast (success, error, info, warning)
 * @param {boolean} props.show - Whether to show the toast
 * @param {Function} props.onClose - Function to call when toast closes
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 */
const Toast = ({
  message,
  type = 'info',
  show = false,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast--${type} ${isVisible ? 'toast--visible' : 'toast--hidden'}`}>
      <div className="toast__content">
        <span className="toast__icon">{getIcon()}</span>
        <span className="toast__message">{message}</span>
      </div>
      <button
        className="toast__close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose && onClose();
          }, 300);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
