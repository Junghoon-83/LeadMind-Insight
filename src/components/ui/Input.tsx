'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full h-[52px] px-4 rounded-xl
            border-2 border-[var(--color-violet-200)]
            bg-white text-[var(--color-text)]
            placeholder:text-[var(--color-gray-400)]
            focus:outline-none focus:border-[var(--color-action)]
            transition-colors duration-200
            ${error ? 'border-red-400 focus:border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--color-gray-600)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
