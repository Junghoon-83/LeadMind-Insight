'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { concerns as staticConcerns } from '@/data/concerns';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, getDiagnosisDuration, getKoreanTime } from '@/lib/saveAssessment';

// 카테고리 태그 색상
const CATEGORY_COLORS = {
  E: { bg: 'bg-blue-50', text: 'text-blue-600', label: '팀 실행력' },
  G: { bg: 'bg-green-50', text: 'text-green-600', label: '팀 성장' },
  C: { bg: 'bg-amber-50', text: 'text-amber-600', label: '팀 소통' },
  L: { bg: 'bg-purple-50', text: 'text-purple-600', label: '리더십' },
} as const;

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

  // 선택된 고민 목록
  const selectedConcernItems = useMemo(() => {
    return concerns.filter((c) => selectedConcerns.includes(c.id));
  }, [concerns, selectedConcerns]);

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
            고민을 알려주세요
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            해당하는 고민을 모두 선택해주세요
          </p>
        </motion.div>

        {/* Flat List with Category Tags */}
        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {concerns.length > 0 ? (
            concerns.map((concern, index) => {
              const category = concern.categories[0];
              const colorStyle = CATEGORY_COLORS[category];
              const selected = isSelected(concern.id);

              return (
                <motion.button
                  key={concern.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => toggleConcern(concern.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? 'border-[var(--color-action)] bg-[var(--color-violet-50)]'
                      : 'border-[var(--color-gray-200)] bg-white hover:border-[var(--color-violet-200)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 체크 아이콘 */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                      selected
                        ? 'border-[var(--color-action)] bg-[var(--color-action)]'
                        : 'border-[var(--color-gray-300)]'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 카테고리 태그 */}
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1.5 ${colorStyle.bg} ${colorStyle.text}`}>
                        #{colorStyle.label}
                      </span>
                      {/* 고민 텍스트 */}
                      <p className={`text-sm leading-relaxed ${
                        selected ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-gray-700)]'
                      }`}>
                        {concern.label}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-40 text-[var(--color-gray-400)]">
              고민 키워드 데이터를 추가해주세요
            </div>
          )}
        </div>

        {/* 선택 요약 */}
        <AnimatePresence>
          {selectedConcernItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[var(--color-gray-200)] pt-4 mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  선택한 고민
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-action)] text-white text-xs font-bold">
                  {selectedConcernItems.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedConcernItems.map((item) => {
                  const colorStyle = CATEGORY_COLORS[item.categories[0]];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm leading-relaxed"
                    >
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colorStyle.bg} ${colorStyle.text}`}>
                        #{colorStyle.label}
                      </span>
                      <span className="text-[var(--color-gray-700)]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <div className="pt-2">
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
