'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, MessageCircle, Send, Loader2, FileText, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, getOrCreateSessionId } from '@/lib/saveAssessment';
import type { ServiceType } from '@/types';

export default function UpsellPage() {
  const router = useRouter();
  const { nickname, email, company, department, jobRole, leadershipType } = useAssessmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  const handleApply = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      const selectedServices: ServiceType[] = ['expert_consultation'];

      await saveAssessment({
        status: 'completed',
        selectedServices,
      });

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
            더 깊이 있는 리더십 성장을 위한 서비스입니다.
          </p>
        </motion.div>

        {/* Main Service - 전문가 1:1 상담 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="none" className="overflow-hidden border-2 border-[var(--color-action)] bg-[var(--color-violet-50)]">
            {/* Header */}
            <div className="p-4">
              <h3 className="font-semibold text-[var(--color-text)] text-lg">
                전문가 1:1 상담
              </h3>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 pt-0">
              <div className="p-4 bg-white rounded-xl border border-[var(--color-violet-100)]">
                {/* Service Image */}
                <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/images/Service_2.png"
                    alt="전문가 1:1 상담"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Description */}
                <p className="text-sm text-[var(--color-gray-700)] leading-relaxed">
                  팀 운영 방향성부터 저성과자 관리, 1:1 면담 기술까지. 검증된 리더십 전문가와 현재 직면한 리더십 과제에 대해 구체적인 해결책과 실행 전략을 함께 수립해보세요.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Other Services Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-[var(--color-violet-100)] rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                다양한 케어 서비스 이용 가능
              </p>
              <p className="text-sm text-[var(--color-gray-600)] leading-relaxed">
                상담 신청 시 팀 진단 Link, 팀 마인드 케어 워크숍, 팀 이슈 케어 솔루션 등 필요에 따라 다른 서비스도 함께 안내받으실 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Email Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-4 bg-[var(--color-violet-100)] rounded-xl"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                신청 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                상담 신청하기
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
