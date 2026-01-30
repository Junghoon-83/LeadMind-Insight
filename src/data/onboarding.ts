import type { OnboardingSlide } from '@/types';

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: '리드 마인드 케어',
    description: '성과를 만드는 리더십을 넘어\n팀을 연결하는 링커십으로',
    images: [
      '/images/Slide1_1.png',
      '/images/Slide1_2.png',
      '/images/Slide1_3.png',
    ],
  },
  {
    id: 2,
    title: '데이터 기반 리더십 진단',
    description: '상담심리 전문가가 검증한 데이터 기반\n리더십×팔로워십 상호작용 진단',
    image: '/images/onboarding-2.png',
  },
  {
    id: 3,
    title: '5분으로 시작하는 변화',
    description: '간편한 진단 후 바로 적용 가능한\n나만의 맞춤 솔루션을 받아보세요.',
    image: '/images/onboarding-3.png',
  },
];
