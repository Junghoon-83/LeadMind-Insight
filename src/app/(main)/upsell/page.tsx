'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Send, Loader2, Info, Sparkles, RotateCcw } from 'lucide-react';
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
      <Header
        title="리드 마인드 케어"
        showBack
        onBack={handleBack}
        rightElement={
          <button
            onClick={handleViewResult}
            className="flex items-center gap-1 py-2 pl-2 pr-2 -mr-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
            aria-label="진단 결과 다시보기"
          >
            <span className="text-sm">다시보기</span>
            <RotateCcw className="w-5 h-5" />
          </button>
        }
      />

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
          <Card padding="none" className="overflow-hidden bg-white">
            {/* Recommended Badge */}
            <div className="px-4 pt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-action)] rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">추천 서비스</span>
              </div>
            </div>

            {/* Header */}
            <div className="px-4 pt-3 pb-2">
              <h3 className="font-bold text-[var(--color-text)] text-xl">
                전문가 1:1 상담
              </h3>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {/* Service Image */}
              <div className="relative w-full h-44 mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/images/Service_2.png"
                  alt="전문가 1:1 상담"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Description */}
              <p className="text-sm text-[var(--color-gray-700)] leading-relaxed mb-4">
                팀 운영 방향성부터 저성과자 관리, 1:1 면담 기술까지. 검증된 리더십 전문가와 현재 직면한 리더십 과제에 대해 구체적인 해결책과 실행 전략을 함께 수립해보세요.
              </p>

              {/* CTA Button inside Card */}
              {isSubmitted ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">신청이 완료되었습니다!</p>
                  <p className="text-sm text-green-600 mt-1">
                    담당자가 곧 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <>
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
                  <div className="text-center mt-3">
                    <p className="text-sm text-[var(--color-gray-600)] font-medium">
                      {email || 'email@example.com'}
                    </p>
                    <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
                      위 이메일로 상세 안내를 보내드립니다.
                    </p>
                  </div>
                </>
              )}
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
            <p className="text-sm text-[var(--color-gray-600)] leading-relaxed">
              상담 신청 시 팀 진단 Link, 팀 마인드 케어 워크숍, 팀 이슈 케어 솔루션 등 필요에 따라 다른 서비스도 함께 안내받으실 수 있습니다.
            </p>
          </div>
        </motion.div>

        {/* Secondary Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={handleInquiry}
            className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-primary)] transition-colors underline underline-offset-2"
          >
            문의하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
