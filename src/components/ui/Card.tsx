'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  animate = false,
  className = '',
}: CardProps) {
  const baseStyles = 'rounded-2xl bg-white';

  const variants = {
    default: 'shadow-[var(--shadow-card)]',
    elevated: 'shadow-lg shadow-violet-200/50',
    bordered: 'border-2 border-[var(--color-violet-200)]',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={combinedClassName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={combinedClassName}>{children}</div>;
}
