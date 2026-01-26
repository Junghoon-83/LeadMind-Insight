'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui';
import { CATEGORY_NAMES, type ConcernCategory, type ConcernItem } from '@/data/concerns';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function ConcernsPage() {
  const router = useRouter();
  const { nickname, selectedConcerns, toggleConcern } = useAssessmentStore();
  const [concerns, setConcerns] = useState<ConcernItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 고민 데이터 로드
  useEffect(() => {
    async function fetchConcerns() {
      try {
        const res = await fetch('/api/concerns');
        const data = await res.json();
        setConcerns(data.concerns || []);
      } catch (error) {
        console.error('Failed to fetch concerns:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConcerns();
  }, []);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  const handleBack = () => {
    router.replace('/diagnosis');
  };

  const handleNext = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-gray-500)]">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
            disabled={selectedConcerns.length === 0}
          >
            다음
          </Button>
          <p className="text-center text-sm text-[var(--color-gray-400)] mt-3">
            {selectedConcerns.length}개 선택됨
          </p>
        </div>
      </div>
    </div>
  );
}
