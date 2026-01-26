'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { concerns as staticConcerns, CATEGORY_NAMES, type ConcernCategory } from '@/data/concerns';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, getDiagnosisDuration, getKoreanTime } from '@/lib/saveAssessment';

export default function ConcernsPage() {
  const router = useRouter();
  const { nickname, selectedConcerns, toggleConcern } = useAssessmentStore();
  const concerns = staticConcerns;
  const [isNavigating, setIsNavigating] = useState(false);

  // 다음 페이지 프리페치
  useEffect(() => {
    router.prefetch('/loading');
  }, [router]);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  const handleBack = () => {
    router.replace('/diagnosis');
  };

  const handleNext = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // 백그라운드에서 저장 (비동기, fire-and-forget)
    const diagnosisTime = getDiagnosisDuration();
    saveAssessment({
      status: 'concerns',
      concerns: selectedConcerns,
      diagnosisEndedAt: getKoreanTime(),
      ...diagnosisTime,
    });

    // 즉시 화면 전환
    router.push('/loading');
  };

  const isSelected = (id: string) => selectedConcerns.includes(id);

  // Group concerns by their primary category (groupName)
  const groupedConcerns = useMemo(() => {
    const groups: { name: string; category: ConcernCategory; items: typeof concerns }[] = [];
    const categoryOrder: ConcernCategory[] = ['E', 'G', 'C', 'L'];

    categoryOrder.forEach((cat) => {
      const items = concerns.filter((c) => c.categories[0] === cat);
      if (items.length > 0) {
        groups.push({
          name: CATEGORY_NAMES[cat],
          category: cat,
          items,
        });
      }
    });

    return groups;
  }, [concerns]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="고민 선택" showBack onBack={handleBack} />

      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            <span className="text-[var(--color-primary)]">{nickname}</span>님의
          </h1>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            고민을 알려주세요
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            복수 선택 가능합니다
          </p>
        </motion.div>

        {/* Grouped Keywords */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {groupedConcerns.length > 0 ? (
            groupedConcerns.map((group, groupIndex) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                {/* Group Header */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-[var(--color-gray-600)]">
                    {group.name}
                  </h3>
                </div>

                {/* Group Items */}
                <div className="space-y-2">
                  {group.items.map((concern, index) => (
                    <motion.button
                      key={concern.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.03 }}
                      onClick={() => toggleConcern(concern.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm leading-relaxed ${
                        isSelected(concern.id)
                          ? 'border-[var(--color-action)] bg-[var(--color-violet-50)] text-[var(--color-primary)]'
                          : 'border-[var(--color-gray-200)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-violet-200)]'
                      }`}
                    >
                      {concern.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex items-center justify-center h-40 text-[var(--color-gray-400)]">
              고민 키워드 데이터를 추가해주세요
            </div>
          )}
        </div>

        {/* Button */}
        <div className="pt-6">
          <Button
            fullWidth
            onClick={handleNext}
            disabled={selectedConcerns.length === 0 || isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                분석 준비 중...
              </>
            ) : (
              '다음'
            )}
          </Button>
          <p className="text-center text-sm text-[var(--color-gray-400)] mt-3">
            {selectedConcerns.length}개 선택됨
          </p>
        </div>
      </div>
    </div>
  );
}
