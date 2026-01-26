'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[var(--color-gray-600)]">진행률</span>
          <span className="font-semibold text-[var(--color-primary)]">
            {current} / {total}
          </span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
