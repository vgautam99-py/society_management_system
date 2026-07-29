import React from 'react';

export const Spinner = ({ size = 'md', color = 'text-primary-600', fullScreen = false, center = true }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-4',
  };

  const spinnerElement = (
    <div className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${color}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }

  if (center) {
    return (
      <div className="flex justify-center items-center py-8 w-full">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Spinner;
