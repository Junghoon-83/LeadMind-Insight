'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { calculateScores, determineLeadershipType } from '@/data/leadershipTypes';

export default function LoadingPage() {
  const router = useRouter();
  const { answers, setResult } = useAssessmentStore();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const analyze = async () => {
      // 2초 후 페이드아웃 시작
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsExiting(true);

      // 0.5초 페이드아웃 후 이동
      await new Promise((resolve) => setTimeout(resolve, 500));

      const scores = calculateScores(answers);
      const leadershipType = determineLeadershipType(scores);

      setResult(scores, leadershipType);
      router.push('/profile');
    };

    analyze();
  }, [answers, setResult, router]);

  return (
    <motion.main
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6"
    >
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
              boxShadow: '0 0 40px 15px rgba(139, 92, 246, 0.3), 0 4px 20px rgba(139, 92, 246, 0.35)',
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
          className="text-lg font-semibold text-violet-600 mb-1"
        >
          리더십 분석 중
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
    </motion.main>
  );
}
