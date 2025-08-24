import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable Loading Spinner Component
 * @param {Object} props
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.color - Color theme (primary, secondary, white)
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`loading-spinner loading-spinner--${size} loading-spinner--${color} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
