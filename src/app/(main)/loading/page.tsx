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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-violet-50)] via-white to-white px-6">
      {/* Animated Circle */}
      <motion.div
        className="relative w-36 h-36 mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 blur-xl opacity-30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-violet-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute inset-3 rounded-full border-[3px] border-dashed border-violet-300"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner gradient circle */}
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="text-sm font-medium text-[var(--color-action)] tracking-wider mb-2">
          LEADMIND CARE
        </h2>
        <p className="text-xl font-bold text-[var(--color-text)]">
          리더십 분석이 진행중입니다
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-48 h-1 bg-violet-100 rounded-full mt-10 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '50%' }}
        />
      </motion.div>
    </div>
  );
}
