'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment } from '@/lib/saveAssessment';
import type { ServiceType } from '@/types';

interface ServiceOption {
  id: ServiceType;
  label: string;
  description: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: 'team_diagnosis_link',
    label: '팀 진단 Link 발송',
    description: '팀원들에게 진단 링크를 보내 팀 전체 분석을 받아보세요',
  },
  {
    id: 'expert_consultation',
    label: '전문가 1:1 상담',
    description: '리더십 전문가와 1:1 상담을 통해 깊이 있는 코칭을 받으세요',
  },
  {
    id: 'team_workshop',
    label: '팀 마인드 케어 워크샵',
    description: '팀 빌딩과 소통 향상을 위한 맞춤형 워크샵을 진행합니다',
  },
  {
    id: 'team_solution',
    label: '팀 이슈 케어 솔루션',
    description: '팀 내 갈등과 이슈를 해결하기 위한 전문 솔루션을 제공합니다',
  },
];

export default function UpsellPage() {
  const router = useRouter();
  const { nickname, email } = useAssessmentStore();
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);

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
    // 서비스 선택 저장
    await saveAssessment({
      status: 'completed',
      selectedServices,
    });

    alert('서비스 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.');
  };

  const handleBack = () => {
    router.replace('/team-result');
  };

  const handleInquiry = () => {
    // TODO: 문의하기 기능 구현 (이메일 또는 채널톡 등)
    window.location.href = 'mailto:contact@leadmindinsight.com';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header title="케어 서비스" showBack onBack={handleBack} />

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
          {serviceOptions.map((service, index) => (
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
                  padding="lg"
                  className={`transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-2 border-[var(--color-action)] bg-[var(--color-violet-100)]'
                      : 'border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        selectedServices.includes(service.id)
                          ? 'bg-[var(--color-action)] border-[var(--color-action)]'
                          : 'border-[var(--color-violet-200)]'
                      }`}
                    >
                      {selectedServices.includes(service.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {service.label}
                      </h3>
                      <p className="text-sm text-[var(--color-gray-600)] mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
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
        <Button
          fullWidth
          onClick={handleApply}
          disabled={selectedServices.length === 0}
        >
          <Send className="w-5 h-5 mr-2" />
          서비스 신청하기
        </Button>
        <Button fullWidth variant="outline" onClick={handleInquiry}>
          <MessageCircle className="w-5 h-5 mr-2" />
          문의하기
        </Button>
      </div>
    </div>
  );
}
