'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { concerns as staticConcerns, type ConcernCategory } from '@/data/concerns';
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

  const MAX_CONCERNS = 3;
  const isSelected = (id: string) => selectedConcerns.includes(id);
  const isMaxSelected = selectedConcerns.length >= MAX_CONCERNS;

  // 카테고리별로 고민 그룹화
  const groupedConcerns = concerns.reduce((acc, concern) => {
    const category = concern.categories[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(concern);
    return acc;
  }, {} as Record<ConcernCategory, typeof concerns>);

  const categoryOrder: ConcernCategory[] = ['E', 'G', 'C', 'L'];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="고민 선택" showBack onBack={handleBack} />

      <div className="flex-1 flex flex-col px-6 py-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            <span className="text-[var(--color-primary)]">{nickname}</span>님의
          </h1>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            고민을 알려주세요.
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            요즘 가장 고민되는 것을 골라주세요. (1~3개)
          </p>
        </motion.div>

        {/* Concerns List */}
        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {categoryOrder.map((category, categoryIndex) => {
            const items = groupedConcerns[category];
            if (!items || items.length === 0) return null;

            return items.map((concern, index) => {
              const selected = isSelected(concern.id);

              const isDisabled = !selected && isMaxSelected;

              return (
                <motion.button
                  key={concern.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.05 + index * 0.02 }}
                  onClick={() => !isDisabled && toggleConcern(concern.id)}
                  disabled={isDisabled}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? 'border-[var(--color-action)] bg-[var(--color-violet-50)]'
                      : isDisabled
                        ? 'border-[var(--color-gray-200)] bg-[var(--color-gray-100)] opacity-50 cursor-not-allowed'
                        : 'border-[var(--color-gray-200)] bg-white hover:border-[var(--color-violet-200)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 체크박스 */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selected
                        ? 'border-[var(--color-action)] bg-[var(--color-action)]'
                        : 'border-[var(--color-gray-300)]'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* 고민 텍스트 */}
                    <p className={`text-sm leading-relaxed ${
                      selected ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-gray-700)]'
                    }`}>
                      {concern.label}
                    </p>
                  </div>
                </motion.button>
              );
            });
          })}
        </div>

        {/* Button */}
        <div className="pt-4">
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
              `다음 (${selectedConcerns.length}개 선택됨)`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
