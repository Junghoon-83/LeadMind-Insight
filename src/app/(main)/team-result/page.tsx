'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card, LiquidLoading } from '@/components/ui';
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
    return <LiquidLoading title="팀 궁합 분석 중" />;
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
                      궁합 데이터를 추가해주세요.
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
