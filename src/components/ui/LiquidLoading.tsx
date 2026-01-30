'use client';

import { motion } from 'framer-motion';

interface LiquidLoadingProps {
  title?: string;
  subtitle?: string;
  /** 전체 페이지로 렌더링 (기본값: true) */
  fullPage?: boolean;
}

function LiquidBlobContent({
  title = '로딩 중',
  subtitle = '잠시만 기다려주세요.',
}: Omit<LiquidLoadingProps, 'fullPage'>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      {/* Liquid blob */}
      <div className="relative w-24 h-24 mx-auto mb-10">
        {/* Main liquid blob with glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600"
          style={{
            boxShadow:
              '0 0 40px 15px rgba(139, 92, 246, 0.3), 0 4px 20px rgba(139, 92, 246, 0.35)',
            borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
          }}
          animate={{
            borderRadius: [
              '70% 30% 30% 70% / 60% 40% 60% 40%',
              '30% 70% 70% 30% / 40% 60% 40% 60%',
              '55% 45% 40% 60% / 65% 35% 65% 35%',
              '40% 60% 65% 35% / 35% 65% 35% 65%',
              '70% 30% 30% 70% / 60% 40% 60% 40%',
            ],
            scale: [1, 1.02, 0.98, 1.01, 1],
            x: [0, -2, 1, -1, 0],
            y: [0, 1, -2, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary blob - creates depth */}
        <motion.div
          className="absolute inset-2 bg-gradient-to-tr from-violet-400/70 to-purple-500/70"
          style={{
            borderRadius: '40% 60% 60% 40% / 50% 50% 50% 50%',
          }}
          animate={{
            borderRadius: [
              '40% 60% 60% 40% / 50% 50% 50% 50%',
              '60% 40% 40% 60% / 45% 55% 45% 55%',
              '50% 50% 55% 45% / 60% 40% 60% 40%',
              '55% 45% 45% 55% / 50% 50% 50% 50%',
              '40% 60% 60% 40% / 50% 50% 50% 50%',
            ],
            scale: [1, 0.96, 1.03, 0.98, 1],
            x: [0, 2, -2, 1, 0],
            y: [0, -2, 1, -1, 0],
            rotate: [0, 3, -2, 1, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Highlight - liquid reflection */}
        <motion.div
          className="absolute inset-5 bg-gradient-to-br from-white/45 via-white/20 to-transparent"
          style={{
            borderRadius: '60% 40% 50% 50% / 50% 50% 50% 50%',
            opacity: 0.5,
          }}
          animate={{
            borderRadius: [
              '60% 40% 50% 50% / 50% 50% 50% 50%',
              '50% 50% 40% 60% / 40% 60% 40% 60%',
              '45% 55% 55% 45% / 55% 45% 55% 45%',
              '60% 40% 50% 50% / 50% 50% 50% 50%',
            ],
            opacity: [0.5, 0.35, 0.45, 0.5],
            x: [0, 3, -2, 0],
            y: [0, 2, -1, 0],
            scale: [1, 0.92, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg font-semibold text-[var(--color-primary)] mb-1"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-sm text-gray-400"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

export default function LiquidLoading({
  title,
  subtitle,
  fullPage = true,
}: LiquidLoadingProps) {
  if (fullPage) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6">
        <LiquidBlobContent title={title} subtitle={subtitle} />
      </main>
    );
  }

  return <LiquidBlobContent title={title} subtitle={subtitle} />;
}

// 내부 콘텐츠만 필요한 경우 사용
export { LiquidBlobContent };
