'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card, Input } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment } from '@/lib/saveAssessment';
import { followershipTypes as staticFollowershipTypes, type FollowershipTypeCode } from '@/data/followershipTypes';

export default function TeamInputPage() {
  const router = useRouter();
  const { nickname, teamMembers, addTeamMember, removeTeamMember } =
    useAssessmentStore();

  const followershipTypes = staticFollowershipTypes;
  const [selectedType, setSelectedType] = useState<string | null>(null);
  // 모든 팔로워십 유형 설명을 기본으로 펼침
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    () => new Set(Object.keys(staticFollowershipTypes))
  );
  const [memberName, setMemberName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // 다음 페이지 프리페치
  useEffect(() => {
    router.prefetch('/team-result');
  }, [router]);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowModal(true);
  };

  const handleToggleExpand = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleAddMember = () => {
    if (memberName.trim() && selectedType) {
      addTeamMember(memberName.trim(), selectedType);
      setMemberName('');
      setSelectedType(null);
      setShowModal(false);
    }
  };

  const handleBack = () => {
    router.replace('/result');
  };

  const handleNext = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // 백그라운드에서 저장 (비동기, fire-and-forget)
    saveAssessment({
      status: 'team',
      teamMembers: teamMembers.map((m) => ({ name: m.name, type: m.type })),
    });

    // 즉시 화면 전환
    router.push('/team-result');
  };

  const followershipTypesList = Object.values(followershipTypes);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header title="팀원 입력" showBack onBack={handleBack} />

      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            팀원 이해하기
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            팔로워십 유형을 선택하고 팀원을 추가해주세요.
          </p>
        </motion.div>

        {/* Followership Types */}
        {followershipTypesList.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-6"
          >
            {followershipTypesList.map((type, index) => {
              const isExpanded = expandedTypes.has(type.type);
              return (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border-2 border-[var(--color-violet-200)] overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {type.name}
                      </h3>
                      <p className="text-xs text-[var(--color-primary)] truncate">
                        {type.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Expand Button */}
                      <button
                        onClick={(e) => handleToggleExpand(type.type, e)}
                        className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-primary)] hover:bg-[var(--color-violet-100)] rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      {/* Add Button */}
                      <button
                        onClick={() => handleTypeSelect(type.type)}
                        className="p-2 text-white bg-[var(--color-action)] hover:bg-[var(--color-action-hover)] rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Description */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <div className="p-3 bg-[var(--color-violet-50)] rounded-lg">
                            <p className="text-sm text-[var(--color-gray-600)] leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <Card padding="lg" className="mb-6 text-center">
            <p className="text-[var(--color-gray-400)]">
              팔로워십 유형 데이터를 추가해주세요
            </p>
          </Card>
        )}

        {/* Added Members */}
        {teamMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-[var(--color-gray-600)] mb-3">
              추가된 팀원 ({teamMembers.length}명)
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {teamMembers.map((member) => {
                  const typeInfo = followershipTypes[member.type as FollowershipTypeCode];
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {member.name}
                        </p>
                        <p className="text-xs text-[var(--color-gray-400)]">
                          {typeInfo?.name || member.type}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="p-2 text-[var(--color-gray-400)] hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <Button fullWidth onClick={handleNext} disabled={teamMembers.length === 0 || isNavigating}>
          {isNavigating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              분석 준비 중...
            </>
          ) : (
            '결과 보기'
          )}
        </Button>
        <p className="text-center text-sm text-[var(--color-gray-400)] mt-3">
          최소 1명 이상의 팀원을 추가해주세요
        </p>
      </div>

      {/* Add Member Modal - 중앙 배치로 키보드가 가리지 않도록 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-[380px] rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
                팀원 이름 입력
              </h3>
              <p className="text-sm text-[var(--color-gray-600)] mb-4">
                {selectedType && followershipTypes[selectedType as FollowershipTypeCode]?.name} 유형의 팀원
                이름을 입력해주세요.
              </p>
              <Input
                placeholder="팀원 이름"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowModal(false);
                    setMemberName('');
                    setSelectedType(null);
                  }}
                >
                  취소
                </Button>
                <Button fullWidth onClick={handleAddMember} disabled={!memberName.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
