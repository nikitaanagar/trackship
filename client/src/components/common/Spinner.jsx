import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-brand-blue border-t-transparent ${sizeClasses[size]} ${className}`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Spinner;
