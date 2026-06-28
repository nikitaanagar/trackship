import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-brand-navy">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3 py-2 border rounded-lg text-sm text-brand-navy placeholder-brand-muted bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors
          ${error ? 'border-brand-danger focus:ring-brand-danger/50 focus:border-brand-danger' : 'border-brand-border'}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-brand-danger font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
