import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 py-2 text-sm shadow-sm hover:shadow-md";
  
  const variants = {
    primary: "bg-brand-blue hover:bg-blue-700 text-white focus:ring-brand-blue border border-transparent",
    secondary: "bg-white hover:bg-gray-50 text-brand-navy border border-brand-border focus:ring-brand-blue",
    danger: "bg-brand-danger hover:bg-red-700 text-white focus:ring-brand-danger border border-transparent"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 border-white" />}
      {children}
    </button>
  );
};

export default Button;
