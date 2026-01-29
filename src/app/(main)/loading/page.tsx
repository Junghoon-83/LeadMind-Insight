'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { calculateScores, determineLeadershipType } from '@/data/leadershipTypes';

export default function LoadingPage() {
  const router = useRouter();
  const { answers, setResult } = useAssessmentStore();

  useEffect(() => {
    // 분석 로직 실행
    const analyze = async () => {
      // 최소 2.5초 대기 (신뢰감 제공)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 점수 계산 및 유형 판정
      const scores = calculateScores(answers);
      const leadershipType = determineLeadershipType(scores);

      setResult(scores, leadershipType);
      router.push('/profile');
    };

    analyze();
  }, [answers, setResult, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[var(--color-violet-50)] to-white px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Liquid blob animation */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 blur-2xl opacity-40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main liquid blob */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600"
            animate={{
              borderRadius: [
                '60% 40% 30% 70% / 60% 30% 70% 40%',
                '30% 60% 70% 40% / 50% 60% 30% 60%',
                '60% 40% 30% 70% / 60% 30% 70% 40%',
              ],
              rotate: [0, 180, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner highlight blob */}
          <motion.div
            className="absolute inset-4 bg-gradient-to-br from-white/30 to-transparent"
            animate={{
              borderRadius: [
                '40% 60% 70% 30% / 40% 50% 60% 50%',
                '70% 30% 50% 50% / 30% 30% 70% 70%',
                '40% 60% 70% 30% / 40% 50% 60% 50%',
              ],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg font-medium text-violet-600 mb-2"
        >
          리더십 분석 중
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-gray-500"
        >
          잠시만 기다려주세요
        </motion.p>
      </motion.div>
    </main>
  );
}
