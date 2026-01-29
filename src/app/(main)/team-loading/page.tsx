'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LiquidBlobContent } from '@/components/ui';

export default function TeamLoadingPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 2초 후 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // 2.5초 후 페이지 이동
    const navTimer = setTimeout(() => {
      router.push('/team-result');
    }, 2500);

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
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6"
    >
      <LiquidBlobContent title="팀 궁합 분석 중" />
    </motion.main>
  );
}
