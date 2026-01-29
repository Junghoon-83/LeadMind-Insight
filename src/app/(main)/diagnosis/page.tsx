'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { ProgressBar, Card } from '@/components/ui';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, setDiagnosisStartTime } from '@/lib/saveAssessment';
import { questions as staticQuestions } from '@/data/questions';

export default function DiagnosisPage() {
  const router = useRouter();
  const questions = staticQuestions;
  const totalQuestions = staticQuestions.length;

  const {
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setCurrentQuestionIndex,
    nickname,
  } = useAssessmentStore();

  // 마지막 저장한 인덱스 추적 (중복 저장 방지)
  const lastSavedIndex = useRef<number>(-1);

  // 현재 진행 상황 저장 함수
  const saveProgress = useCallback(async (questionIndex: number) => {
    // 이미 저장한 인덱스면 스킵
    if (lastSavedIndex.current === questionIndex) return;
    lastSavedIndex.current = questionIndex;

    await saveAssessment({
      status: 'diagnosis',
      lastQuestionIndex: questionIndex + 1, // 1-indexed (Q1=1, Q23=23)
      answers: useAssessmentStore.getState().answers,
    });
  }, []);

  // 페이지 로드 시 스크롤 맨 위로 + 진단 시작 저장 + 프리페치
  useEffect(() => {
    window.scrollTo(0, 0);
    router.prefetch('/concerns');
    // 진단 시작 시간 기록
    setDiagnosisStartTime();
    // 진단 시작 기록
    saveProgress(currentQuestionIndex);
  }, [router]);


  // 페이지 이탈 시 진행 상황 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentIndex = useAssessmentStore.getState().currentQuestionIndex;
      // sendBeacon으로 비동기 저장 (페이지 닫혀도 전송됨)
      navigator.sendBeacon(
        '/api/assessments',
        JSON.stringify({
          id: localStorage.getItem('leadmind-session-id'),
          status: 'diagnosis',
          lastQuestionIndex: currentIndex + 1, // 1-indexed (Q1=1, Q23=23)
          answers: useAssessmentStore.getState().answers,
        })
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgress(useAssessmentStore.getState().currentQuestionIndex);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveProgress]);

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
    const handlePopState = () => {
      // 현재 스토어의 인덱스 확인
      const storeIndex = useAssessmentStore.getState().currentQuestionIndex;

      if (storeIndex > 0) {
        isBackNavigation.current = true;
        useAssessmentStore.setState({ currentQuestionIndex: storeIndex - 1 });
      } else {
        // Q1에서 뒤로가기 시 온보딩으로 이동
        router.replace('/onboarding');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  // 문항 앞으로 이동 시에만 히스토리 추가 (뒤로가기 시에는 추가하지 않음)
  useEffect(() => {
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
  }, [currentQuestionIndex]);

  const currentQuestion = questions[safeQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleScoreSelect = (score: number) => {
    if (!currentQuestion) return;

    setAnswer(currentQuestion.id, score);

    // 5문항마다 또는 마지막 문항일 때 진행 상황 저장
    const nextIndex = safeQuestionIndex + 1;
    if (nextIndex % 5 === 0 || nextIndex >= totalQuestions) {
      saveProgress(safeQuestionIndex);
    }

    // 자동으로 다음 문항으로 이동
    setTimeout(() => {
      if (safeQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        router.push('/concerns');
      }
    }, 300);
  };

  const handleBack = () => {
    const currentIndex = useAssessmentStore.getState().currentQuestionIndex;
    if (currentIndex > 0) {
      useAssessmentStore.setState({ currentQuestionIndex: currentIndex - 1 });
    } else {
      router.replace('/onboarding');
    }
  };

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
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header - 뷰포트 상단 고정 */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white z-50">
        <Header title="리더십 진단" showBack onBack={handleBack} />
      </div>

      {/* Question Area - 헤더 아래 */}
      <div className="pt-14 px-6">
        <div className="pt-[110px]">
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
              <div className="mb-3 text-center">
                <span className="text-base font-medium text-[var(--color-action)]">
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
      </div>

      {/* Scale Buttons - 뷰포트 60% 지점 고정 */}
      <div className="fixed top-[66%] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-40">
        <div key={`buttons-${currentQuestion.id}`} className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((score) => {
            const isSelected = currentAnswer === score;
            return (
              <div key={score} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScoreSelect(score)}
                  className="scale-btn active:scale-95 transition-transform"
                  style={{
                    borderColor: isSelected ? 'var(--color-action)' : 'var(--color-violet-200)',
                    backgroundColor: isSelected ? 'var(--color-action)' : 'var(--color-white)',
                    color: isSelected ? 'white' : 'var(--color-text)',
                  }}
                >
                  {score}
                </button>
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
            );
          })}
        </div>
      </div>

      {/* Progress Bar - 뷰포트 하단 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-6 py-3 border-t border-[var(--color-violet-100)] z-40">
        <ProgressBar current={safeQuestionIndex + 1} total={totalQuestions} />
        <p className="text-xs text-[var(--color-gray-400)] text-center mt-2">
          점수를 선택하면 자동으로 다음 문항으로 넘어갑니다
        </p>
      </div>
    </div>
  );
}
