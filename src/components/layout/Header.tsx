'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button */}
        <div className="flex items-center">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-0.5 py-2 pr-2 -ml-2 rounded-full hover:bg-[var(--color-violet-100)] active:bg-[var(--color-violet-200)] transition-colors"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="w-6 h-6 text-[var(--color-gray-600)]" />
              <span className="text-sm text-[var(--color-gray-600)]">이전</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-action)] to-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">LM</span>
            </div>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          {title ? (
            <h1 className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </h1>
          ) : (
            <h1 className="text-base font-bold text-[var(--color-primary)]">
              리드마인드인사이트
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--color-gray-400)] -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Custom element */}
        <div className="w-12 flex justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  );
}
