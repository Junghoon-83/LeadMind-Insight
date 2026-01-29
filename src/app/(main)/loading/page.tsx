'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { calculateScores, determineLeadershipType } from '@/data/leadershipTypes';
import { LiquidBlobContent } from '@/components/ui';

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
      <LiquidBlobContent title="리더십 분석 중" />
    </motion.main>
  );
}
