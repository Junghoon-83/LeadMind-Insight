'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronRight, ImageIcon, RotateCcw, Play, Eye } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { onboardingSlides } from '@/data/onboarding';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { saveAssessment, resetSession } from '@/lib/saveAssessment';

type Step = 'carousel' | 'nickname' | 'intro';
type PreviousDataType = 'completed' | 'in-progress' | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('carousel');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 다중 이미지 인덱스
  const [nicknameInput, setNicknameInput] = useState('');
  const [showPreviousDataModal, setShowPreviousDataModal] = useState(false);
  const [previousDataType, setPreviousDataType] = useState<PreviousDataType>(null);
  const { setNickname, nickname, leadershipType, answers, reset } = useAssessmentStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트에서만 실행되도록 hydration 체크 + 프리페치
  useEffect(() => {
    setIsHydrated(true);
    router.prefetch('/diagnosis');
  }, [router]);

  // 다중 이미지 자동 전환 (4초 간격, 페이드 전환 1.2초)
  useEffect(() => {
    const currentSlideData = onboardingSlides[currentSlide];
    if (!currentSlideData.images || currentSlideData.images.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        (prev + 1) % currentSlideData.images!.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  // 슬라이드 변경 시 이미지 인덱스 리셋
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentSlide]);

  // 기존 데이터 확인 (hydration 완료 후)
  useEffect(() => {
    if (!isHydrated) return;

    const hasAnswers = Object.keys(answers).length > 0;
    const hasResult = !!leadershipType;

    if (hasResult) {
      setPreviousDataType('completed');
      setShowPreviousDataModal(true);
    } else if (hasAnswers) {
      setPreviousDataType('in-progress');
      setShowPreviousDataModal(true);
    }
  }, [isHydrated, answers, leadershipType]);

  // 이전 결과 보기
  const handleViewPreviousResult = () => {
    router.push('/result');
  };

  // 이어서 진행
  const handleContinue = () => {
    setShowPreviousDataModal(false);
    router.push('/diagnosis');
  };

  // 새로 시작 (새 세션 ID 생성)
  const handleStartFresh = () => {
    reset();              // Zustand 스토어 리셋
    resetSession();       // 세션 ID 및 시간 정보 리셋
    setShowPreviousDataModal(false);
    setPreviousDataType(null);
  };

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setStep('nickname');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 스와이프 핸들러
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // 최소 스와이프 거리
    if (info.offset.x < -threshold) {
      // 왼쪽으로 스와이프 -> 다음 슬라이드
      handleNextSlide();
    } else if (info.offset.x > threshold) {
      // 오른쪽으로 스와이프 -> 이전 슬라이드
      handlePrevSlide();
    }
  };

  const handleNicknameSubmit = () => {
    if (nicknameInput.trim()) {
      setNickname(nicknameInput.trim());
      setStep('intro');
    }
  };

  const handleStart = () => {
    // 즉시 화면 전환 (빠른 UX)
    router.push('/diagnosis');

    // 백그라운드에서 저장 (비동기, fire-and-forget)
    saveAssessment({
      status: 'onboarding',
      nickname: nickname,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white animate-fade-in"
    >
      <AnimatePresence mode="wait">
        {/* Carousel Step */}
        {step === 'carousel' && (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Slide Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="text-center w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
                >
                  {/* Large Rounded Image */}
                  <div
                    className="w-[280px] h-[280px] rounded-[28px] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 flex items-center justify-center overflow-hidden relative"
                    style={{ boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.25)' }}
                  >
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
                    {onboardingSlides[currentSlide].images ? (
                      // 다중 이미지 - 깔끔한 페이드 전환
                      <>
                        {onboardingSlides[currentSlide].images.map((imgSrc, idx) => {
                          const isActive = idx === currentImageIndex;
                          return (
                            <div
                              key={idx}
                              className="absolute inset-0 z-10 transition-opacity duration-[1200ms] ease-in-out"
                              style={{
                                opacity: isActive ? 1 : 0,
                              }}
                            >
                              <Image
                                src={imgSrc}
                                alt={`${onboardingSlides[currentSlide].title} ${idx + 1}`}
                                width={280}
                                height={280}
                                className="w-full h-full object-cover object-center"
                                priority={idx === 0}
                              />
                            </div>
                          );
                        })}
                      </>
                    ) : onboardingSlides[currentSlide].image ? (
                      <Image
                        src={onboardingSlides[currentSlide].image!}
                        alt={onboardingSlides[currentSlide].title}
                        width={280}
                        height={280}
                        className="w-full h-full object-cover relative z-10"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-violet-300 relative z-10">
                        <ImageIcon className="w-16 h-16" />
                        <span className="text-sm font-medium">이미지 준비중</span>
                      </div>
                    )}
                  </div>

                  {/* Dots Indicator - Between Image and Title */}
                  <div className="flex justify-center gap-2.5 mt-10 mb-6">
                    {onboardingSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'w-7 bg-gradient-to-r from-violet-500 to-purple-500'
                            : 'w-2.5 bg-violet-200 hover:bg-violet-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-[1.625rem] font-bold text-[var(--color-text)] mb-3 tracking-tight">
                    {onboardingSlides[currentSlide].title}
                  </h2>

                  {/* Description */}
                  <p className="text-[var(--color-gray-600)] whitespace-pre-line leading-[1.7] text-[15px] px-2">
                    {onboardingSlides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Button */}
            <div className="px-6 pb-10 pt-4">
              <Button fullWidth onClick={handleNextSlide}>
                {currentSlide < onboardingSlides.length - 1 ? (
                  <>
                    다음
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                ) : (
                  '시작하기'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Nickname Step */}
        {step === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-16 pb-10"
          >
            <div className="flex-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                  리더님, 환영합니다!
                </h2>
                <h2 className="text-xl font-medium text-[var(--color-primary)] mb-10">
                  어떻게 불러드리면 좋을까요?
                </h2>

                <Input
                  placeholder="닉네임이나 영어 이름도 괜찮아요."
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={10}
                  autoFocus
                />

                <p className="text-sm text-[var(--color-gray-400)] mt-3">
                  최대 10자까지 입력 가능합니다
                </p>
              </motion.div>
            </div>

            <Button
              fullWidth
              onClick={handleNicknameSubmit}
              disabled={!nicknameInput.trim()}
            >
              저장하기
            </Button>
          </motion.div>
        )}

        {/* Intro Step */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col px-6 pt-16 pb-10"
          >
            <div className="flex-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-violet-100)] to-[var(--color-violet-200)] flex items-center justify-center shadow-md">
                  <span className="text-4xl">👋</span>
                </div>

                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                  <span className="text-[var(--color-primary)]">{nickname}</span>님, 반가워요.
                </h2>

                <p className="text-[var(--color-gray-600)] mt-4 leading-relaxed">
                  변화의 시대, 새로운 리더십을 위한<br />
                  발걸음을 시작해볼까요?
                </p>

                <div className="mt-8 p-5 rounded-2xl bg-[var(--color-violet-50)] border border-[var(--color-violet-100)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--color-gray-600)]">예상 소요 시간</span>
                    <span className="font-semibold text-[var(--color-primary)]">약 5분</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-gray-600)]">총 문항 수</span>
                    <span className="font-semibold text-[var(--color-primary)]">23문항</span>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-gray-400)] mt-6 leading-relaxed">
                  솔직하게 답변해 주실수록<br />
                  더 정확한 진단 결과를 받으실 수 있습니다.
                </p>
              </motion.div>
            </div>

            <Button fullWidth onClick={handleStart}>
              진단 시작하기
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이전 데이터 존재 모달 */}
      <AnimatePresence>
        {showPreviousDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
            onClick={() => setShowPreviousDataModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {previousDataType === 'completed' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-center text-[var(--color-text)] mb-2">
                    이전 진단 결과가 있습니다
                  </h3>
                  <p className="text-center text-[var(--color-gray-600)] text-sm mb-6">
                    {nickname}님의 진단 결과를 확인하거나<br />
                    새로운 진단을 시작할 수 있습니다.
                  </p>
                  <div className="space-y-3">
                    <Button fullWidth onClick={handleViewPreviousResult}>
                      <Eye className="w-5 h-5 mr-2" />
                      이전 결과 보기
                    </Button>
                    <button
                      onClick={handleStartFresh}
                      className="w-full py-3 px-4 rounded-xl border-2 border-[var(--color-violet-200)] text-[var(--color-gray-600)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-violet-50)] transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      새로 시작하기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-center text-[var(--color-text)] mb-2">
                    진행 중인 진단이 있습니다
                  </h3>
                  <p className="text-center text-[var(--color-gray-600)] text-sm mb-6">
                    이전에 진행하던 진단을 이어서 할 수 있습니다.
                  </p>
                  <div className="space-y-3">
                    <Button fullWidth onClick={handleContinue}>
                      <Play className="w-5 h-5 mr-2" />
                      이어서 진행하기
                    </Button>
                    <button
                      onClick={handleStartFresh}
                      className="w-full py-3 px-4 rounded-xl border-2 border-[var(--color-violet-200)] text-[var(--color-gray-600)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-violet-50)] transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      새로 시작하기
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
