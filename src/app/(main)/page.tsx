'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/50 to-white px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        {/* Liquid blob container */}
        <div className="relative w-40 h-40 mx-auto mb-12">
          {/* Ambient glow - large soft */}
          <motion.div
            className="absolute -inset-8 rounded-full bg-gradient-to-br from-violet-300/40 via-purple-400/30 to-fuchsia-300/40 blur-3xl"
            animate={{
              scale: [1, 1.2, 1.1, 1],
              opacity: [0.4, 0.6, 0.5, 0.4],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Background blob - slowest, largest */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-br from-violet-400/60 via-purple-500/50 to-fuchsia-400/60"
            style={{ filter: 'blur(8px)' }}
            animate={{
              borderRadius: [
                '40% 60% 70% 30% / 40% 30% 70% 60%',
                '70% 30% 50% 50% / 30% 60% 40% 70%',
                '50% 50% 30% 70% / 60% 40% 60% 40%',
                '40% 60% 70% 30% / 40% 30% 70% 60%',
              ],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Main blob - primary visual */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 -4px 12px rgba(0,0,0,0.1)',
            }}
            animate={{
              borderRadius: [
                '60% 40% 30% 70% / 60% 30% 70% 40%',
                '40% 60% 70% 30% / 30% 60% 40% 70%',
                '30% 70% 40% 60% / 50% 40% 60% 50%',
                '70% 30% 60% 40% / 40% 70% 30% 60%',
                '60% 40% 30% 70% / 60% 30% 70% 40%',
              ],
              rotate: [0, 45, 90, 135, 180],
              scale: [1, 1.02, 0.98, 1.01, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Secondary blob - offset timing */}
          <motion.div
            className="absolute inset-3 bg-gradient-to-tr from-purple-400/80 via-violet-500/70 to-purple-600/80"
            animate={{
              borderRadius: [
                '50% 50% 40% 60% / 40% 60% 40% 60%',
                '60% 40% 60% 40% / 50% 50% 50% 50%',
                '40% 60% 50% 50% / 60% 40% 60% 40%',
                '50% 50% 40% 60% / 40% 60% 40% 60%',
              ],
              rotate: [0, -30, -60, -90, -120],
              scale: [1, 0.98, 1.02, 0.99, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Highlight layer - glass effect */}
          <motion.div
            className="absolute inset-6 bg-gradient-to-br from-white/40 via-white/20 to-transparent"
            animate={{
              borderRadius: [
                '70% 30% 50% 50% / 50% 50% 50% 50%',
                '50% 50% 70% 30% / 30% 70% 30% 70%',
                '30% 70% 30% 70% / 70% 30% 70% 30%',
                '70% 30% 50% 50% / 50% 50% 50% 50%',
              ],
              opacity: [0.6, 0.4, 0.5, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner glow - center accent */}
          <motion.div
            className="absolute inset-10 rounded-full bg-gradient-to-br from-white/50 to-violet-200/30"
            style={{ filter: 'blur(4px)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/60"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, (i % 2 === 0 ? 8 : -8), 0],
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2"
        >
          리드 마인드 케어
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-sm font-medium text-gray-400 tracking-wider"
        >
          LeadMind Care
        </motion.p>
      </motion.div>
    </main>
  );
}
