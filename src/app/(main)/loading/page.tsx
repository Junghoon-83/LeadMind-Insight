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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[var(--color-background)] to-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Logo with pulse animation */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <motion.div
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-action)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-violet-300"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-white text-3xl font-bold">LM</span>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-bold text-[var(--color-primary)] mb-2"
        >
          리드 마인드 케어
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-[var(--color-gray-600)] mb-8"
        >
          리더십 분석 중
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-[var(--color-action)]"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
