'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import type { LeadershipTypeInfo, FollowershipTypeInfo, Compatibility } from '@/types';

export default function TeamResultPage() {
  const router = useRouter();
  const { nickname, leadershipType, teamMembers } = useAssessmentStore();

  const [leadershipTypes, setLeadershipTypes] = useState<Record<string, LeadershipTypeInfo>>({});
  const [followershipTypes, setFollowershipTypes] = useState<Record<string, FollowershipTypeInfo>>({});
  const [compatibilityData, setCompatibilityData] = useState<Record<string, Record<string, Compatibility>>>({});
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      try {
        const [leaderRes, followerRes] = await Promise.all([
          fetch('/api/leadership'),
          fetch('/api/followership?includeCompatibility=true'),
        ]);

        const leaderData = await leaderRes.json();
        const followerData = await followerRes.json();

        setLeadershipTypes(leaderData.leadershipTypes || {});
        setFollowershipTypes(followerData.followershipTypes || {});
        setCompatibilityData(followerData.compatibilityData || {});
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 궁합 데이터 가져오기 함수
  const getCompatibility = (leaderType: string, followerType: string): Compatibility | null => {
    return compatibilityData[leaderType]?.[followerType] || null;
  };

  // 팔로워십 유형별로 팀원 그룹화
  const groupedMembers = useMemo(() => {
    const groups: Record<string, { names: string[]; type: string }> = {};

    teamMembers.forEach((member) => {
      const type = member.type;
      if (!groups[type]) {
        groups[type] = { names: [], type };
      }
      groups[type].names.push(member.name);
    });

    return Object.values(groups);
  }, [teamMembers]);

  useEffect(() => {
    if (!nickname || !leadershipType) {
      router.replace('/onboarding');
    }
  }, [nickname, leadershipType, router]);

  // 브라우저 뒤로가기 버튼 처리 - 팀원 입력 페이지로 이동
  const handlePopState = useCallback(() => {
    router.replace('/team-input');
  }, [router]);

  useEffect(() => {
    // 히스토리 상태 설정 (뒤로가기 감지용)
    window.history.pushState({ page: 'team-result' }, '');

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  const leaderInfo = leadershipType ? leadershipTypes[leadershipType] : null;

  const handleBack = () => {
    router.replace('/team-input');
  };

  const handleUpsell = () => {
    router.push('/upsell');
  };

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header title="팀 궁합 분석" showBack onBack={handleBack} />

      <div className="flex-1 px-6 py-8 space-y-6">
        {/* Header Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg" className="text-center">
            {/* Character Image */}
            <div
              className="w-40 h-40 mx-auto mb-4 rounded-full bg-gradient-to-b from-white to-violet-50 p-2.5 flex items-center justify-center border-2 border-violet-100"
              style={{ boxShadow: '0 8px 24px -8px rgba(139, 92, 246, 0.2)' }}
            >
              {leaderInfo?.image ? (
                <Image
                  src={leaderInfo.image}
                  alt={leaderInfo.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--color-action)] to-[var(--color-primary)]">
                  <span className="text-4xl text-white font-bold">
                    {leaderInfo?.name?.charAt(0) || 'L'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--color-action)] font-medium mb-1">
              {nickname}님의 리더십 유형
            </p>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-1">
              {leaderInfo?.name || leadershipType}
            </h2>
            <p className="text-sm text-[var(--color-gray-400)]">
              vs 팀원 {teamMembers.length}명 궁합 분석
            </p>
          </Card>
        </motion.div>

        {/* Team Members Compatibility - 팔로워십 유형별 그룹화 */}
        <div className="space-y-4 -mt-2">
          {groupedMembers.map((group, index) => {
            const followerInfo = followershipTypes[group.type];
            const compatibility = getCompatibility(leadershipType || '', group.type);

            return (
              <motion.div
                key={group.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="lg">
                  {/* Group Header */}
                  <div className="mb-5 pb-4 border-b border-[var(--color-violet-100)]">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded-full mb-2">
                      {followerInfo?.name || group.type}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                      {followerInfo?.title || group.type}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {group.names.map((name, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[var(--color-violet-100)] text-[var(--color-primary)] text-sm rounded-full font-medium"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {compatibility ? (
                    <div className="space-y-4">
                      {/* Strengths */}
                      {compatibility.strengths?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1.5">
                            강점
                          </p>
                          <p className="text-sm text-[var(--color-gray-600)] leading-relaxed">
                            {compatibility.strengths.join(' ')}
                          </p>
                        </div>
                      )}

                      {/* Cautions */}
                      {compatibility.cautions?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1.5">
                            주의점
                          </p>
                          <p className="text-sm text-[var(--color-gray-600)] leading-relaxed">
                            {compatibility.cautions.join(' ')}
                          </p>
                        </div>
                      )}

                      {/* Tips */}
                      {compatibility.tips?.length > 0 && (
                        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl mt-2">
                          <p className="text-xs font-bold text-[var(--color-primary)] tracking-wide mb-1.5">
                            코칭 Tip
                          </p>
                          <p className="text-sm text-[var(--color-gray-700)] leading-relaxed">
                            {compatibility.tips[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-gray-400)]">
                      궁합 데이터를 추가해주세요
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8 pb-8"
        >
          <Button fullWidth onClick={handleUpsell}>
            서비스 더 알아보기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
