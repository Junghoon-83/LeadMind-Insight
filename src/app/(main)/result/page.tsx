'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Users, Lightbulb, MessageCircle, Target, Search, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { analyzeConcerns, CATEGORY_NAMES, type ConcernCategory } from '@/data/concerns';
import type { LeadershipTypeInfo } from '@/types';
import type { SolutionData } from '@/data/solutions';

// 카테고리별 고정 색상
const CATEGORY_COLORS: Record<ConcernCategory, string> = {
  L: 'bg-violet-600',
  E: 'bg-indigo-500',
  G: 'bg-emerald-500',
  C: 'bg-amber-500',
};

function CategoryBadge({ category }: { category: ConcernCategory }) {
  return (
    <span className={`px-3 py-1 ${CATEGORY_COLORS[category]} text-white rounded-full text-sm font-medium`}>
      {CATEGORY_NAMES[category]}
    </span>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { nickname, scores, leadershipType, selectedConcerns, reset } = useAssessmentStore();
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [leadershipTypes, setLeadershipTypes] = useState<Record<string, LeadershipTypeInfo>>({});
  const [solutions, setSolutions] = useState<Record<string, SolutionData>>({});
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      try {
        const [leadershipRes, solutionsRes] = await Promise.all([
          fetch('/api/leadership'),
          fetch('/api/solutions'),
        ]);
        const leadershipData = await leadershipRes.json();
        const solutionsData = await solutionsRes.json();
        setLeadershipTypes(leadershipData.leadershipTypes || {});
        setSolutions(solutionsData.solutions || {});
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!nickname || !leadershipType) {
      router.replace('/onboarding');
    }
  }, [nickname, leadershipType, router]);

  const typeInfo = leadershipType ? leadershipTypes[leadershipType] : null;

  // Analyze concerns and get solution
  const concernAnalysis = useMemo(() => {
    return analyzeConcerns(selectedConcerns);
  }, [selectedConcerns]);

  const solutionData: SolutionData | null = useMemo(() => {
    return solutions[concernAnalysis.combinationId] || null;
  }, [solutions, concernAnalysis.combinationId]);

  // 차트 데이터 (원본 점수 유지, 6점 만점)
  const chartData = scores
    ? [
        { label: '성장', value: scores.growth, color: 'from-violet-500 to-purple-600' },
        { label: '공유', value: scores.sharing, color: 'from-indigo-500 to-violet-600' },
        { label: '상호작용', value: scores.interaction, color: 'from-purple-500 to-pink-500' },
      ]
    : [];

  const handleBack = () => {
    router.replace('/profile');
  };

  const handleTeamInput = () => {
    router.push('/team-input');
  };

  const handleStartOver = () => {
    reset();
    router.push('/onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-gray-500)]">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!typeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-gray-400)]">리더십 유형 데이터를 추가해주세요</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header title="진단 결과" showBack onBack={handleBack} />

      <div className="flex-1 px-6 py-8 space-y-6">
        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="text-center">
            {/* Character Image */}
            <div
              className="w-52 h-52 mx-auto mb-6 rounded-full bg-gradient-to-b from-white to-violet-50 p-3 flex items-center justify-center border-2 border-violet-100"
              style={{ boxShadow: '0 12px 32px -12px rgba(139, 92, 246, 0.25)' }}
            >
              {typeInfo.image ? (
                <Image
                  src={typeInfo.image}
                  alt={typeInfo.name}
                  width={208}
                  height={208}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--color-action)] to-[var(--color-primary)]">
                  <span className="text-5xl text-white font-bold">
                    {typeInfo.name?.charAt(0) || 'L'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--color-action)] font-medium mb-1">
              {nickname}님의 리더십 유형
            </p>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {typeInfo.name}
            </h2>
            <p className="text-[var(--color-primary)] font-medium">{typeInfo.title}</p>
          </Card>
        </motion.div>

        {/* Vertical Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-6 text-center">
              리더십 역량 분석
            </h3>
            <div className="flex justify-center items-end gap-6 h-48">
              {chartData.map((item, index) => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                  {/* Bar Container */}
                  <div className="relative w-16 h-36 bg-gray-100 rounded-2xl overflow-hidden flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.value / 6) * 100}%` }}
                      transition={{
                        delay: 0.3 + index * 0.15,
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className={`w-full bg-gradient-to-t ${item.color} rounded-2xl relative`}
                    >
                      {/* Score inside bar */}
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.15 }}
                        className="absolute inset-x-0 top-3 text-center text-white font-bold text-lg"
                      >
                        {item.value.toFixed(1)}
                      </motion.span>
                    </motion.div>
                  </div>
                  {/* Label */}
                  <span className="text-sm font-medium text-[var(--color-gray-600)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-[var(--color-gray-400)] mt-4">
              6점 만점 기준
            </p>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="lg">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
              유형 설명
            </h3>
            <p className="text-[var(--color-gray-600)] leading-relaxed">
              {typeInfo.description}
            </p>

            {typeInfo.strengths?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-[var(--color-point)] mb-2">
                  강점
                </h4>
                <div className="flex flex-wrap gap-2">
                  {typeInfo.strengths.map((strength, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typeInfo.challenges?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-amber-500 mb-2">
                  성장 포인트
                </h4>
                <div className="flex flex-wrap gap-2">
                  {typeInfo.challenges.map((challenge, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm"
                    >
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Concern Analysis */}
        {selectedConcerns.length > 0 && solutionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[var(--color-action)]" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                나의 고민 진단
              </h3>
            </div>
            <Card padding="lg">
              {/* Primary Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {concernAnalysis.combinationId === 'P07' ? (
                  // P07: 모든 영역에서 고민 - 4개 카테고리 모두 표시
                  (['L', 'E', 'G', 'C'] as const).map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))
                ) : (
                  <>
                    {concernAnalysis.primaryA && (
                      <CategoryBadge category={concernAnalysis.primaryA} />
                    )}
                    {concernAnalysis.primaryB && (
                      <CategoryBadge category={concernAnalysis.primaryB} />
                    )}
                  </>
                )}
              </div>

              {/* Solution Title */}
              <p className="text-[var(--color-primary)] font-semibold mb-3">
                {solutionData.title}
              </p>

              {/* Core Issue */}
              <p className="text-[var(--color-gray-600)] text-sm leading-relaxed">
                {solutionData.coreIssue}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Field Voices */}
        {solutionData && solutionData.fieldVoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card padding="lg" className="bg-[var(--color-violet-50)]">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-[var(--color-action)]" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  비슷한 고민을 가진 리더의 목소리
                </h3>
              </div>
              <div className="space-y-2">
                {solutionData.fieldVoices.map((voice, index) => (
                  <p
                    key={index}
                    className="text-sm text-[var(--color-gray-700)] italic pl-3 border-l-2 border-[var(--color-violet-200)]"
                  >
                    &quot;{voice}&quot;
                  </p>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Diagnosis */}
        {solutionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[var(--color-action)]" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  상세 진단
                </h3>
              </div>
              <p className="text-[var(--color-gray-600)] text-sm leading-relaxed">
                {solutionData.diagnosis}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Action Solutions */}
        {solutionData && solutionData.actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-[var(--color-action)]" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                맞춤 솔루션
              </h3>
            </div>
            <div className="space-y-3">
              {solutionData.actions.map((action, index) => (
                <Card key={index} padding="none" className="overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedAction(expandedAction === index ? null : index)
                    }
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-action)] text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-[var(--color-text)]">
                        {action.title}
                      </span>
                    </div>
                    {expandedAction === index ? (
                      <ChevronUp className="w-5 h-5 text-[var(--color-action)] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--color-gray-400)] flex-shrink-0" />
                    )}
                  </button>
                  {expandedAction === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 space-y-4"
                    >
                      {/* Method */}
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--color-action)] mb-1">
                          방법
                        </h4>
                        <p className="text-[var(--color-gray-600)] text-sm leading-relaxed">
                          {action.method}
                        </p>
                      </div>

                      {/* Effect */}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-500 mb-1">
                          기대효과
                        </h4>
                        <p className="text-[var(--color-gray-600)] text-sm leading-relaxed">
                          {action.effect}
                        </p>
                      </div>

                      {/* Leadership Tip */}
                      <div className="bg-[var(--color-violet-50)] rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-[var(--color-primary)] mb-1">
                          리더십 Tip
                        </h4>
                        <p className="text-[var(--color-gray-700)] text-sm leading-relaxed italic">
                          {action.leadershipTip}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 pb-8 space-y-3"
        >
          <Button fullWidth onClick={handleTeamInput}>
            <Users className="w-5 h-5 mr-2" />
            팀원 이해하기
          </Button>
          <button
            onClick={handleStartOver}
            className="w-full py-3 px-4 rounded-xl border-2 border-[var(--color-violet-200)] text-[var(--color-gray-600)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-violet-50)] transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            처음부터 다시하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
