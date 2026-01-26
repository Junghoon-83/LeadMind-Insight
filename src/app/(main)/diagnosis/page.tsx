'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { ProgressBar, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import type { Question } from '@/types';

export default function DiagnosisPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  const {
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setCurrentQuestionIndex,
    nickname,
  } = useAssessmentStore();

  // 페이지 로드 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 문항 데이터 로드
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotalQuestions(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // 닉네임 없으면 온보딩으로
  useEffect(() => {
    if (!nickname) {
      router.replace('/onboarding');
    }
  }, [nickname, router]);

  // 인덱스가 범위를 벗어나면 0으로 리셋
  const safeQuestionIndex = questions.length > 0 && currentQuestionIndex >= questions.length
    ? 0
    : currentQuestionIndex;

  // 인덱스가 조정되었으면 스토어도 업데이트
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(0);
    }
  }, [questions.length, currentQuestionIndex, setCurrentQuestionIndex]);

  // 브라우저 뒤로가기 처리를 위한 ref
  const isBackNavigation = useRef(false);
  const prevQuestionIndex = useRef(currentQuestionIndex);

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    if (loading || questions.length === 0) return;

    const handlePopState = () => {
      // 현재 스토어의 인덱스 확인
      const storeIndex = useAssessmentStore.getState().currentQuestionIndex;

      if (storeIndex > 0) {
        isBackNavigation.current = true;
        prevQuestion();
      } else {
        // Q1에서 뒤로가기 시 온보딩으로 이동
        router.replace('/onboarding');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loading, questions.length, prevQuestion, router]);

  // 문항 앞으로 이동 시에만 히스토리 추가 (뒤로가기 시에는 추가하지 않음)
  useEffect(() => {
    if (loading || questions.length === 0) return;

    // 뒤로가기로 인한 변경이면 히스토리 추가하지 않음
    if (isBackNavigation.current) {
      isBackNavigation.current = false;
      prevQuestionIndex.current = currentQuestionIndex;
      return;
    }

    // 앞으로 이동한 경우에만 히스토리 추가
    if (currentQuestionIndex > prevQuestionIndex.current) {
      window.history.pushState({ questionIndex: currentQuestionIndex }, '');
    }

    prevQuestionIndex.current = currentQuestionIndex;
  }, [currentQuestionIndex, loading, questions.length]);

  const currentQuestion = questions[safeQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleScoreSelect = (score: number) => {
    if (!currentQuestion) return;
    setAnswer(currentQuestion.id, score);

    // 자동으로 다음 문항으로 이동 (마지막 문항이 아닌 경우)
    setTimeout(() => {
      if (safeQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        // 마지막 문항 완료 시 고민 선택 페이지로
        router.push('/concerns');
      }
    }, 300);
  };

  const handleBack = () => {
    if (safeQuestionIndex > 0) {
      prevQuestion();
    } else {
      router.replace('/onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-gray-500)]">문항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    // 문항 로드 실패 또는 데이터 없음
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="text-[var(--color-gray-500)] mb-4">문항 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-[var(--color-primary)] underline"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--color-background)] overflow-hidden">
      {/* Header - 상단 고정 */}
      <div className="shrink-0 bg-white">
        <Header title="리더십 진단" showBack onBack={handleBack} />
      </div>

      {/* Question - 중앙 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="min-h-[200px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              {/* Question Number */}
              <div className="mb-4">
                <span className="text-sm font-medium text-[var(--color-action)]">
                  Q{safeQuestionIndex + 1}
                </span>
              </div>

              {/* Question Text */}
              <Card padding="lg">
                <p className="text-lg font-medium text-[var(--color-text)] leading-relaxed">
                  {currentQuestion.text}
                </p>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scale Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          {[1, 2, 3, 4, 5, 6].map((score) => (
            <div key={score} className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScoreSelect(score)}
                className={`scale-btn ${
                  currentAnswer === score ? 'selected' : ''
                }`}
              >
                {score}
              </motion.button>
              {score === 1 && (
                <span className="text-xs text-[var(--color-gray-400)] whitespace-nowrap">전혀 아니다</span>
              )}
              {score === 6 && (
                <span className="text-xs text-[var(--color-gray-400)] whitespace-nowrap">매우 그렇다</span>
              )}
              {score !== 1 && score !== 6 && (
                <span className="text-xs invisible">-</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar - 하단 고정 */}
      <div className="shrink-0 bg-white px-6 py-3 border-t border-[var(--color-violet-100)]">
        <ProgressBar current={safeQuestionIndex + 1} total={totalQuestions} />
        <p className="text-xs text-[var(--color-gray-400)] text-center mt-2">
          점수를 선택하면 자동으로 다음 문항으로 넘어갑니다
        </p>
      </div>
    </div>
  );
}
