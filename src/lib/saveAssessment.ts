// 진단 데이터 저장 상태
export type AssessmentStatus =
  | 'onboarding'
  | 'diagnosis'
  | 'concerns'
  | 'profile'
  | 'result'
  | 'team'
  | 'service'
  | 'completed';

export interface AssessmentData {
  id: string;
  createdAt?: string;
  status: AssessmentStatus;
  lastQuestionIndex?: number;
  nickname?: string;
  company?: string;
  department?: string;
  jobRole?: string;
  email?: string;
  agreedToTerms?: boolean;
  answers?: Record<number, number>;
  scoreGrowth?: number;
  scoreSharing?: number;
  scoreInteraction?: number;
  leadershipType?: string;
  concerns?: string[];
  teamMembers?: Array<{ name: string; type: string }>;
  selectedServices?: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// 세션 ID 생성 또는 가져오기
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'leadmind-session-id';
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

// 생성 시간 가져오기 또는 생성
export function getOrCreateCreatedAt(): string {
  if (typeof window === 'undefined') return new Date().toISOString();

  const STORAGE_KEY = 'leadmind-created-at';
  let createdAt = localStorage.getItem(STORAGE_KEY);

  if (!createdAt) {
    createdAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, createdAt);
  }

  return createdAt;
}

// UTM 파라미터 가져오기
export function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

// 진단 데이터 저장
export async function saveAssessment(data: Partial<AssessmentData>): Promise<boolean> {
  try {
    const sessionId = getOrCreateSessionId();
    const createdAt = getOrCreateCreatedAt();
    const utmParams = getUtmParams();

    const payload: AssessmentData = {
      id: sessionId,
      createdAt,
      status: 'onboarding',
      ...utmParams,
      ...data,
    };

    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to save assessment:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving assessment:', error);
    return false;
  }
}
