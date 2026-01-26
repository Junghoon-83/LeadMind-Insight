'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button, Input } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import type { JobRole } from '@/types';

const jobRoles: JobRole[] = ['마케팅', '기획', '경영지원', '개발', '디자인', '기타'];

// 커스텀 드롭다운 컴포넌트
function Dropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-[52px] px-4 rounded-xl border-2 bg-white text-left flex items-center justify-between transition-colors ${
            isOpen
              ? 'border-[var(--color-action)]'
              : 'border-[var(--color-violet-200)]'
          }`}
        >
          <span className={value ? 'text-[var(--color-text)]' : 'text-[var(--color-gray-400)]'}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-[var(--color-gray-400)] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            {/* Dropdown List */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 w-full mt-2 bg-white rounded-xl border-2 border-[var(--color-violet-200)] shadow-lg overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-[var(--color-violet-50)] transition-colors ${
                    value === option
                      ? 'bg-[var(--color-violet-100)] text-[var(--color-primary)] font-medium'
                      : 'text-[var(--color-text)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { nickname, setProfile, company, department, jobRole, email, agreedToTerms } =
    useAssessmentStore();

  const [formData, setFormData] = useState({
    company: company,
    department: department,
    jobRole: jobRole,
    email: email,
    agreedToTerms: agreedToTerms,
  });
  const [emailError, setEmailError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  // 브라우저 뒤로가기 버튼 처리 - 고민 선택 페이지로 이동
  const handlePopState = useCallback(() => {
    router.replace('/concerns');
  }, [router]);

  useEffect(() => {
    // 히스토리 상태 설정 (뒤로가기 감지용)
    window.history.pushState({ page: 'profile' }, '');

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (value && !validateEmail(value)) {
      setEmailError('올바른 이메일 형식을 입력해주세요');
    } else {
      setEmailError('');
    }
  };

  const isFormValid =
    formData.company &&
    formData.department &&
    formData.jobRole &&
    formData.email &&
    validateEmail(formData.email) &&
    formData.agreedToTerms;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setProfile({
      company: formData.company,
      department: formData.department,
      jobRole: formData.jobRole as JobRole,
      email: formData.email,
      agreedToTerms: formData.agreedToTerms,
    });

    // TODO: DB에 User 생성 및 Assessment 결과 저장
    router.push('/result');
  };

  const handleBack = () => {
    router.replace('/concerns');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="프로필 입력" showBack onBack={handleBack} />

      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            프로필을 입력해주세요
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            맞춤 솔루션 제공을 위해 필요합니다
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 space-y-5"
        >
          <Input
            label="회사명"
            placeholder="회사명을 입력해주세요"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <Input
            label="부서"
            placeholder="부서명을 입력해주세요"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          {/* Job Role Dropdown */}
          <Dropdown
            label="직무"
            placeholder="직무를 선택해주세요"
            value={formData.jobRole}
            options={jobRoles}
            onChange={(value) => setFormData({ ...formData, jobRole: value as JobRole })}
          />

          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={formData.email}
            onChange={handleEmailChange}
            error={emailError}
          />

          {/* Terms Agreement */}
          <div className="pt-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })
                  }
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    formData.agreedToTerms
                      ? 'bg-[var(--color-action)] border-[var(--color-action)]'
                      : 'border-[var(--color-violet-200)]'
                  }`}
                >
                  {formData.agreedToTerms && <Check className="w-4 h-4 text-white" />}
                </button>
                <span className="text-sm text-[var(--color-text)]">
                  개인정보 수집 이용 동의
                </span>
              </label>
              <button
                onClick={() => setShowTermsModal(true)}
                className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-action)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Button */}
        <div className="pt-6">
          <Button fullWidth onClick={handleSubmit} disabled={!isFormValid}>
            다음
          </Button>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setShowTermsModal(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full max-w-[430px] rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
              개인정보 수집 이용 동의
            </h3>
            <div className="text-sm text-[var(--color-gray-600)] space-y-4">
              <p>
                <strong>1. 수집 항목</strong>
                <br />
                닉네임, 회사명, 부서, 직무, 이메일, 진단 결과
              </p>
              <p>
                <strong>2. 수집 목적</strong>
                <br />
                리더십 진단 서비스 제공, 맞춤 솔루션 안내, 서비스 개선
              </p>
              <p>
                <strong>3. 보유 기간</strong>
                <br />
                서비스 이용 종료 시 또는 동의 철회 시까지
              </p>
              <p>
                <strong>4. 동의 거부권</strong>
                <br />
                동의를 거부할 수 있으나, 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>
            <Button fullWidth className="mt-6" onClick={() => setShowTermsModal(false)}>
              확인
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
