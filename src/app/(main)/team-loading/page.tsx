'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TeamLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/team-result');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Liquid blob */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          {/* Soft glow */}
          <motion.div
            className="absolute inset-0 bg-violet-400/30 blur-2xl rounded-full"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main blob */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600"
            style={{
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
            }}
            animate={{
              borderRadius: [
                '60% 40% 30% 70% / 60% 30% 70% 40%',
                '30% 60% 70% 40% / 50% 60% 30% 60%',
                '60% 40% 30% 70% / 60% 30% 70% 40%',
              ],
              scale: [1, 1.03, 1],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Highlight */}
          <motion.div
            className="absolute inset-3 bg-gradient-to-br from-white/35 to-transparent rounded-full"
            animate={{
              opacity: [0.5, 0.7, 0.5],
              scale: [1, 0.95, 1],
            }}
            transition={{
              duration: 2,
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
          className="text-lg font-semibold text-violet-600 mb-1"
        >
          팀 궁합 분석 중
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-gray-400"
        >
          잠시만 기다려주세요
        </motion.p>
      </motion.div>
    </main>
  );
}
