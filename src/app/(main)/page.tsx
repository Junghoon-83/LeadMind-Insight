'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 1.5초 후 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1500);

    // 2초 후 페이지 이동 (페이드아웃 0.5초)
    const navTimer = setTimeout(() => {
      router.push('/onboarding');
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <motion.main
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6 animate-fade-in-fast"
    >
      <div className="text-center">
        {/* Liquid blob */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          {/* Soft glow */}
          <motion.div
            className="absolute -inset-5 bg-violet-400/25 blur-xl rounded-full"
            animate={{
              scale: [1, 1.12, 1.05, 1.1, 1],
              x: [0, 2, -1, 1, 0],
              y: [0, -1, 2, -1, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main liquid blob */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600"
            style={{
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
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
        <h1 className="text-lg font-semibold text-violet-600 mb-1">
          리드 마인드 케어
        </h1>

        <p className="text-sm text-gray-400">
          LeadMind Care
        </p>
      </div>
    </motion.main>
  );
}
