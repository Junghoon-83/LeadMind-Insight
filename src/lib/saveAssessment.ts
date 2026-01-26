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

  // 시간 추적
  diagnosisStartedAt?: string;
  diagnosisEndedAt?: string;
  diagnosisDuration?: number; // 초 단위

  // 상태 & 방문
  lastQuestionIndex?: number;
  visitCount?: number;

  // 유입 경로
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;

  // 디바이스 정보
  deviceType?: string;
  browser?: string;
  screenWidth?: number;

  // 사용자 정보
  nickname?: string;
  company?: string;
  department?: string;
  jobRole?: string;
  email?: string;
  agreedToTerms?: boolean;

  // 진단 결과
  answers?: Record<number, number>;
  scoreGrowth?: number;
  scoreSharing?: number;
  scoreInteraction?: number;
  leadershipType?: string;
  concerns?: string[];

  // 팀 & 서비스
  teamMembers?: Array<{ name: string; type: string }>;
  selectedServices?: string[];
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

// 새 세션 시작 (ID 리셋)
export function resetSession(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'leadmind-session-id';
  const CREATED_AT_KEY = 'leadmind-created-at';
  const DIAGNOSIS_START_KEY = 'leadmind-diagnosis-start';
  const VISIT_COUNT_KEY = 'leadmind-visit-count';

  // 새 세션 ID 생성
  const newSessionId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newSessionId);

  // 시간 정보도 리셋
  localStorage.removeItem(CREATED_AT_KEY);
  localStorage.removeItem(DIAGNOSIS_START_KEY);
  localStorage.removeItem(VISIT_COUNT_KEY);

  return newSessionId;
}

// 방문 횟수 관리 (세션당 한 번만 증가)
export function getVisitCount(): number {
  if (typeof window === 'undefined') return 1;

  const VISIT_COUNT_KEY = 'leadmind-visit-count';
  const SESSION_VISITED_KEY = 'leadmind-session-visited';

  // 이미 이번 세션에서 방문 체크했는지 확인
  const sessionVisited = sessionStorage.getItem(SESSION_VISITED_KEY);
  let visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0');

  if (!sessionVisited) {
    // 새 방문: visitCount 증가
    visitCount += 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visitCount));
    sessionStorage.setItem(SESSION_VISITED_KEY, 'true');
  }

  return visitCount;
}

// 한국 시간 포맷 (YYYY-MM-DD HH:mm:ss)
export function getKoreanTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Seoul' };

  const year = now.toLocaleString('en-CA', { ...options, year: 'numeric' });
  const month = now.toLocaleString('en-CA', { ...options, month: '2-digit' });
  const day = now.toLocaleString('en-CA', { ...options, day: '2-digit' });
  const hour = now.toLocaleString('en-GB', { ...options, hour: '2-digit', hour12: false });
  const minute = now.toLocaleString('en-GB', { ...options, minute: '2-digit' });
  const second = now.toLocaleString('en-GB', { ...options, second: '2-digit' });

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 생성 시간 가져오기 또는 생성 (한국 시간)
export function getOrCreateCreatedAt(): string {
  if (typeof window === 'undefined') return getKoreanTime();

  const STORAGE_KEY = 'leadmind-created-at';
  let createdAt = localStorage.getItem(STORAGE_KEY);

  if (!createdAt) {
    createdAt = getKoreanTime();
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

// 디바이스 타입 감지
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

// 브라우저 감지 (순서 중요! 인앱 브라우저 먼저 체크)
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;

  // 인앱 브라우저 (메신저) - 먼저 체크
  if (ua.includes('KAKAOTALK')) return 'KakaoTalk';
  if (ua.includes('Line')) return 'Line';
  if (ua.includes('NAVER')) return 'Naver';
  if (ua.includes('Instagram')) return 'Instagram';
  if (ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('FB_IAB')) return 'Facebook';
  if (ua.includes('Twitter')) return 'Twitter';

  // Edge는 Chrome보다 먼저 체크 (Edge UA에 Chrome이 포함됨)
  if (ua.includes('Edg')) return 'Edge';
  // Opera는 Chrome보다 먼저 체크 (Opera UA에 Chrome이 포함됨)
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  // Samsung Browser
  if (ua.includes('SamsungBrowser')) return 'Samsung';
  // Firefox
  if (ua.includes('Firefox')) return 'Firefox';
  // Chrome (Safari보다 먼저, Chrome UA에 Safari가 포함됨)
  if (ua.includes('Chrome')) return 'Chrome';
  // Safari (Chrome이 아닌 경우만)
  if (ua.includes('Safari')) return 'Safari';

  return 'Other';
}

// 디바이스 정보 가져오기
export function getDeviceInfo(): { deviceType: string; browser: string; screenWidth: number; referrer: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', screenWidth: 0, referrer: '' };
  }

  return {
    deviceType: getDeviceType(),
    browser: getBrowser(),
    screenWidth: window.innerWidth,
    referrer: document.referrer || '',
  };
}

// 진단 시작 시간 저장 (한국 시간)
export function setDiagnosisStartTime(): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem('leadmind-diagnosis-start');
  if (!existing) {
    localStorage.setItem('leadmind-diagnosis-start', getKoreanTime());
  }
}

// 진단 소요 시간 계산
export function getDiagnosisDuration(): { diagnosisStartedAt?: string; diagnosisDuration?: number } {
  if (typeof window === 'undefined') return {};

  const startTime = localStorage.getItem('leadmind-diagnosis-start');
  if (!startTime) return {};

  const start = new Date(startTime);
  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - start.getTime()) / 1000);

  return {
    diagnosisStartedAt: startTime,
    diagnosisDuration: durationSeconds,
  };
}

// 진단 데이터 저장
export async function saveAssessment(data: Partial<AssessmentData>): Promise<boolean> {
  try {
    const sessionId = getOrCreateSessionId();
    const createdAt = getOrCreateCreatedAt();
    const utmParams = getUtmParams();
    const deviceInfo = getDeviceInfo();
    const visitCount = getVisitCount();

    const payload: AssessmentData = {
      id: sessionId,
      createdAt,
      status: 'onboarding',
      visitCount,
      ...utmParams,
      ...deviceInfo,
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
