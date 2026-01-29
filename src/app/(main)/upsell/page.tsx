'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Send, Loader2, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, getOrCreateSessionId } from '@/lib/saveAssessment';
import type { ServiceType } from '@/types';

interface ServiceOption {
  id: ServiceType;
  label: string;
  description: string;
  extendedDescription: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: 'team_diagnosis_link',
    label: '팀 진단 Link',
    description: '팀원들에게 진단 링크를 보내 팀 전체 분석을 받아보세요',
    extendedDescription: '팀원 개개인의 팔로워십 유형을 진단하고, 팀 전체의 역학 관계를 분석합니다. 리더와 팀원 간의 궁합을 파악하여 효과적인 협업 전략을 제시합니다.',
  },
  {
    id: 'expert_consultation',
    label: '전문가 1:1 상담',
    description: '리더십 전문가와 1:1 상담을 통해 깊이 있는 코칭을 받으세요',
    extendedDescription: '검증된 리더십 전문가가 진단 결과를 바탕으로 맞춤형 코칭을 제공합니다. 현재 직면한 리더십 과제에 대한 구체적인 해결책과 실행 전략을 함께 수립합니다.',
  },
  {
    id: 'team_workshop',
    label: '팀 마인드 케어 워크샵',
    description: '팀 빌딩과 소통 향상을 위한 맞춤형 워크샵을 진행합니다',
    extendedDescription: '팀의 진단 결과를 기반으로 설계된 맞춤형 워크샵입니다. 팀원 간 이해도를 높이고, 효과적인 소통 방식을 체험하며, 팀 시너지를 극대화하는 활동을 진행합니다.',
  },
  {
    id: 'team_solution',
    label: '팀 이슈 케어 솔루션',
    description: '팀 내 갈등과 이슈를 해결하기 위한 전문 솔루션을 제공합니다',
    extendedDescription: '팀 내 갈등, 소통 단절, 성과 저하 등 다양한 이슈에 대한 전문적인 진단과 해결책을 제공합니다. 조직심리 전문가가 팀 상황을 분석하고 맞춤형 개선 방안을 제시합니다.',
  },
];

export default function UpsellPage() {
  const router = useRouter();
  const { nickname, email, company, department, jobRole, leadershipType } = useAssessmentStore();
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  const toggleService = (id: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleApply = async () => {
    // 중복 제출 방지
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      // 서비스 선택 저장 (기존 assessment)
      await saveAssessment({
        status: 'completed',
        selectedServices,
      });

      // 서비스 신청 별도 저장 (서비스신청 시트)
      const sessionId = getOrCreateSessionId();
      await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          nickname,
          email,
          company,
          department,
          jobRole,
          leadershipType,
          services: selectedServices,
        }),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to save service request:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.replace('/team-result');
  };

  const handleInquiry = () => {
    // TODO: 문의하기 기능 구현 (이메일 또는 채널톡 등)
    window.location.href = 'mailto:contact@leadmindinsight.com';
  };

  const handleViewResult = () => {
    router.push('/result');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header title="리드 마인드 케어 서비스" showBack onBack={handleBack} />

      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            <span className="text-[var(--color-primary)]">{nickname}</span>님을 위한
          </h1>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            리드 마인드 케어
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            더 깊이 있는 리더십 성장을 위한 서비스입니다
          </p>
        </motion.div>

        {/* Service Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {serviceOptions.map((service, index) => {
            const isSelected = selectedServices.includes(service.id);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleService(service.id)}
                  className="w-full text-left"
                >
                  <Card
                    padding="none"
                    className={`overflow-hidden transition-all ${
                      isSelected
                        ? 'border-2 border-[var(--color-action)] bg-[var(--color-violet-50)]'
                        : 'border-2 border-transparent hover:border-[var(--color-violet-200)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-action)] border-[var(--color-action)]'
                              : 'border-[var(--color-violet-200)]'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--color-text)]">
                            {service.label}
                          </h3>
                          <p className="text-sm text-[var(--color-gray-600)] mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Always Expanded Content */}
                    <div className="px-4 pb-4 pt-0">
                      <div className="p-4 bg-white rounded-xl border border-[var(--color-violet-100)]">
                        {/* Image Placeholder */}
                        <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-[var(--color-violet-100)] flex items-center justify-center">
                          <span className="text-sm text-[var(--color-gray-400)]">이미지 제공 예정</span>
                        </div>
                        {/* Extended Description */}
                        <p className="text-sm text-[var(--color-gray-700)] leading-relaxed">
                          {service.extendedDescription}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-[var(--color-violet-100)] rounded-xl"
        >
          <p className="text-sm text-[var(--color-gray-600)]">
            서비스 신청 시 등록하신 이메일({email || 'email@example.com'})로 상세
            안내를 보내드립니다.
          </p>
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-8 space-y-3">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 border border-green-200 rounded-xl text-center"
          >
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-700">신청이 완료되었습니다!</p>
            <p className="text-sm text-green-600 mt-1">
              담당자가 곧 연락드리겠습니다.
            </p>
          </motion.div>
        ) : (
          <Button
            fullWidth
            onClick={handleApply}
            disabled={selectedServices.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                신청 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                서비스 신청하기
              </>
            )}
          </Button>
        )}
        <Button fullWidth variant="outline" onClick={handleViewResult}>
          <FileText className="w-5 h-5 mr-2" />
          진단 결과 다시보기
        </Button>
        <Button fullWidth variant="outline" onClick={handleInquiry}>
          <MessageCircle className="w-5 h-5 mr-2" />
          문의하기
        </Button>
      </div>
    </div>
  );
}
