import React from 'react';
import './Typography.css';

/**
 * Reusable Typography Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.variant - Typography variant (h1, h2, h3, h4, h5, h6, body1, body2, caption)
 * @param {string} props.color - Text color (primary, secondary, light)
 * @param {string} props.align - Text alignment (left, center, right)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.as - HTML element to render as
 */
const Typography = ({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'center',
  className = '',
  as,
  ...props
}) => {
  const getElement = () => {
    if (as) return as;

    switch (variant) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'h4': return 'h4';
      case 'h5': return 'h5';
      case 'h6': return 'h6';
      default: return 'p';
    }
  };

  const Element = getElement();

  return (
    <Element
      className={`typography typography--${variant} typography--${color} typography--${align} ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Typography;
