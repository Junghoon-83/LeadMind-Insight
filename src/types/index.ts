// Score Types
export type DiagnosisScore = 1 | 2 | 3 | 4 | 5 | 6;

// User Types
export interface User {
  id: string;
  nickname: string;
  company: string;
  department: string;
  job_role: JobRole;
  email: string;
  created_at: string;
}

export type JobRole = '마케팅' | '기획' | '경영지원' | '개발' | '디자인' | '기타';

// Assessment Types
export interface Assessment {
  id: string;
  user_id: string;
  answers: Record<number, DiagnosisScore>; // questionId -> score (1-6)
  scores: AssessmentScores;
  result_type: string; // 리더십 유형 코드 (사용자 정의)
  selected_concerns: string[];
  created_at: string;
}

export interface AssessmentScores {
  growth: number;      // 성장
  sharing: number;     // 공유
  interaction: number; // 상호작용
  [key: string]: number; // 추가 축을 위한 확장성
}

// Leadership Types - 사용자 정의 가능
export type LeadershipType = string;

export interface LeadershipTypeInfo {
  type: string;
  name: string;
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  image?: string;
}

// Followership Types - 사용자 정의 가능
export type FollowershipType = string;

export interface FollowershipTypeInfo {
  type: string;
  name: string;
  title?: string;
  description: string;
  icon: string;
}

// Team Member
export interface TeamMember {
  id: string;
  assessment_id: string;
  name: string;
  followership_type: string;
  created_at: string;
}

// Compatibility (궁합)
export interface Compatibility {
  leaderType: string;
  followerType: string;
  strengths: string[];
  cautions: string[];
  tips: string[];
}

// Service Request
export interface ServiceRequest {
  id: string;
  user_id: string;
  requested_services: ServiceType[];
  status: 'pending' | 'contacted' | 'completed';
  created_at: string;
}

export type ServiceType =
  | 'team_diagnosis_link'   // 팀 진단 Link 발송
  | 'expert_consultation'   // 전문가 1:1 상담
  | 'team_workshop'         // 팀 마인드 케어 워크숍
  | 'team_solution';        // 팀 이슈 케어 솔루션

// Question Types
export interface Question {
  id: number;
  text: string;
  category: 'growth' | 'sharing' | 'interaction'; // 성장, 공유, 상호작용
  subcategory?: string; // 하위 요인 (예: g1_실패학습, s1_진행공유)
}

// Concern Keywords
export interface Concern {
  id: string;
  label: string;
  category?: string;
}

// Onboarding Slide
export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image?: string;
  images?: string[]; // 여러 이미지 순환용
}

// Solution
export interface Solution {
  id: string;
  concernId: string;
  title: string;
  content: string;
}
