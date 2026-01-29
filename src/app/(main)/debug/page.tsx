'use client';

import { useEffect, useState } from 'react';
import {
  getOrCreateSessionId,
  getOrCreateCreatedAt,
  getUtmParams,
  getDeviceInfo,
  getVisitCount,
  getDiagnosisDuration,
} from '@/lib/saveAssessment';

interface CollectedData {
  // 세션
  sessionId: string;
  createdAt: string;
  visitCount: number;

  // 디바이스
  deviceType: string;
  browser: string;
  screenWidth: number;
  referrer: string;
  userAgent: string;

  // UTM
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // 진단 시간
  diagnosisStartedAt?: string;
  diagnosisDuration?: number;

  // localStorage 원본
  localStorage: Record<string, string>;
}

export default function DebugPage() {
  const [data, setData] = useState<CollectedData | null>(null);
  const [testResults, setTestResults] = useState<{ name: string; pass: boolean; actual: string; expected: string }[]>([]);

  useEffect(() => {
    // 데이터 수집
    const deviceInfo = getDeviceInfo();
    const diagnosisTime = getDiagnosisDuration();

    const collected: CollectedData = {
      sessionId: getOrCreateSessionId(),
      createdAt: getOrCreateCreatedAt(),
      visitCount: getVisitCount(),
      ...deviceInfo,
      userAgent: navigator.userAgent,
      ...getUtmParams(),
      ...diagnosisTime,
      localStorage: {},
    };

    // localStorage 전체 내용
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('leadmind')) {
        collected.localStorage[key] = localStorage.getItem(key) || '';
      }
    }

    setData(collected);

    // 테스트 실행
    runTests(collected);
  }, []);

  const runTests = (collected: CollectedData) => {
    const results: typeof testResults = [];

    // 1. 세션 ID 형식 테스트 (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    results.push({
      name: 'Session ID (UUID 형식)',
      pass: uuidRegex.test(collected.sessionId),
      actual: collected.sessionId,
      expected: 'UUID 형식 (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    });

    // 2. createdAt 형식 테스트 (ISO 8601)
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    results.push({
      name: 'Created At (ISO 형식)',
      pass: isoRegex.test(collected.createdAt),
      actual: collected.createdAt,
      expected: 'ISO 8601 형식',
    });

    // 3. visitCount 테스트 (1 이상의 정수)
    results.push({
      name: 'Visit Count (1 이상)',
      pass: collected.visitCount >= 1 && Number.isInteger(collected.visitCount),
      actual: String(collected.visitCount),
      expected: '1 이상의 정수',
    });

    // 4. Device Type 테스트
    const validDeviceTypes = ['mobile', 'desktop', 'tablet'];
    results.push({
      name: 'Device Type',
      pass: validDeviceTypes.includes(collected.deviceType),
      actual: collected.deviceType,
      expected: 'mobile, desktop, 또는 tablet',
    });

    // 5. Browser 테스트
    const validBrowsers = [
      'Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Samsung',
      'KakaoTalk', 'Line', 'Naver', 'Instagram', 'Facebook', 'Twitter',
      'Other'
    ];
    results.push({
      name: 'Browser',
      pass: validBrowsers.includes(collected.browser),
      actual: collected.browser,
      expected: '일반 브라우저 또는 인앱 브라우저',
    });

    // 6. Screen Width 테스트 (양수)
    results.push({
      name: 'Screen Width (양수)',
      pass: collected.screenWidth > 0,
      actual: String(collected.screenWidth),
      expected: '0보다 큰 값',
    });

    // 7. Browser와 UserAgent 일관성 테스트
    const ua = collected.userAgent.toLowerCase();
    const uaOriginal = collected.userAgent;
    let expectedBrowser = 'Other';

    // 인앱 브라우저 먼저 체크
    if (uaOriginal.includes('KAKAOTALK')) expectedBrowser = 'KakaoTalk';
    else if (uaOriginal.includes('Line')) expectedBrowser = 'Line';
    else if (uaOriginal.includes('NAVER')) expectedBrowser = 'Naver';
    else if (uaOriginal.includes('Instagram')) expectedBrowser = 'Instagram';
    else if (uaOriginal.includes('FBAN') || uaOriginal.includes('FBAV') || uaOriginal.includes('FB_IAB')) expectedBrowser = 'Facebook';
    else if (uaOriginal.includes('Twitter')) expectedBrowser = 'Twitter';
    // 일반 브라우저
    else if (ua.includes('edg')) expectedBrowser = 'Edge';
    else if (ua.includes('opr') || ua.includes('opera')) expectedBrowser = 'Opera';
    else if (ua.includes('samsungbrowser')) expectedBrowser = 'Samsung';
    else if (ua.includes('firefox') || ua.includes('fxios')) expectedBrowser = 'Firefox';
    else if (ua.includes('chrome') || ua.includes('crios')) expectedBrowser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios')) expectedBrowser = 'Safari';

    results.push({
      name: 'Browser-UserAgent 일관성',
      pass: collected.browser === expectedBrowser,
      actual: `감지: ${collected.browser}`,
      expected: `예상: ${expectedBrowser}`,
    });

    // 8. Device Type과 Screen Width 일관성
    let expectedDevice = 'desktop';
    if (collected.screenWidth <= 768) expectedDevice = 'mobile';
    else if (collected.screenWidth <= 1024) expectedDevice = 'tablet';

    // 모바일 UA 체크
    if (/mobile|android|iphone|ipad|tablet/i.test(collected.userAgent)) {
      if (collected.screenWidth <= 768) expectedDevice = 'mobile';
      else expectedDevice = 'tablet';
    }

    results.push({
      name: 'Device Type-Screen 일관성',
      pass: true, // 참고용
      actual: `${collected.deviceType} (${collected.screenWidth}px)`,
      expected: '참고: UA 기반 감지',
    });

    setTestResults(results);
  };

  const passCount = testResults.filter((r) => r.pass).length;
  const totalCount = testResults.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">데이터 수집 디버그</h1>
        <p className="text-gray-600 mb-6">현재 수집되는 모든 데이터와 테스트 결과</p>

        {/* 테스트 결과 요약 */}
        <div className={`p-4 rounded-lg mb-6 ${passCount === totalCount ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <h2 className="font-bold text-lg">
            테스트 결과: {passCount}/{totalCount} 통과
          </h2>
        </div>

        {/* 테스트 상세 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-bold text-lg mb-4">테스트 상세</h2>
          <div className="space-y-2">
            {testResults.map((result, i) => (
              <div
                key={i}
                className={`p-3 rounded ${result.pass ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}
              >
                <div className="flex items-center gap-2">
                  <span>{result.pass ? '✅' : '❌'}</span>
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>실제: {result.actual}</div>
                  <div>기대: {result.expected}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 수집된 데이터 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-bold text-lg mb-4">수집된 데이터</h2>
          {data && (
            <div className="space-y-4">
              <Section title="세션 정보">
                <Row label="Session ID" value={data.sessionId} />
                <Row label="Created At" value={data.createdAt} />
                <Row label="Visit Count" value={String(data.visitCount)} />
              </Section>

              <Section title="디바이스 정보">
                <Row label="Device Type" value={data.deviceType} />
                <Row label="Browser" value={data.browser} />
                <Row label="Screen Width" value={`${data.screenWidth}px`} />
                <Row label="Referrer" value={data.referrer || '(없음)'} />
              </Section>

              <Section title="UTM 파라미터">
                <Row label="utm_source" value={data.utmSource || '(없음)'} />
                <Row label="utm_medium" value={data.utmMedium || '(없음)'} />
                <Row label="utm_campaign" value={data.utmCampaign || '(없음)'} />
              </Section>

              <Section title="진단 시간">
                <Row label="시작 시간" value={data.diagnosisStartedAt || '(진단 시작 전)'} />
                <Row label="소요 시간" value={data.diagnosisDuration ? `${data.diagnosisDuration}초` : '(미완료)'} />
              </Section>

              <Section title="User Agent (원본)">
                <div className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                  {data.userAgent}
                </div>
              </Section>

              <Section title="localStorage (leadmind-*)">
                {Object.entries(data.localStorage).map(([key, value]) => (
                  <Row key={key} label={key} value={value} />
                ))}
              </Section>
            </div>
          )}
        </div>

        {/* UTM 테스트 링크 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-4">UTM 테스트</h2>
          <p className="text-sm text-gray-600 mb-2">아래 링크로 접속하면 UTM 파라미터가 수집됩니다:</p>
          <a
            href="/debug?utm_source=test&utm_medium=debug&utm_campaign=validation"
            className="text-blue-600 underline text-sm break-all"
          >
            /debug?utm_source=test&utm_medium=debug&utm_campaign=validation
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-2">{title}</h3>
      <div className="bg-gray-50 rounded p-3 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-sm">
      <span className="text-gray-500 w-32 shrink-0">{label}:</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}
