'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center';

    const variants = {
      primary:
        'bg-[var(--color-action)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--color-action-hover)] disabled:bg-[var(--color-gray-400)] disabled:shadow-none',
      secondary:
        'bg-[var(--color-violet-100)] text-[var(--color-primary)] hover:bg-[var(--color-violet-200)]',
      outline:
        'border-2 border-[var(--color-violet-200)] bg-white text-[var(--color-text)] hover:border-[var(--color-action)] hover:bg-[var(--color-violet-100)]',
      ghost:
        'text-[var(--color-text)] hover:bg-[var(--color-violet-100)]',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-[52px] px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'cursor-not-allowed opacity-70' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            로딩중...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
