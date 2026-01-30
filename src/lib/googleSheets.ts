import { google } from 'googleapis';
import { logger } from '@/lib/logger';
import { getKoreanTime } from '@/lib/saveAssessment';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_REQUEST_SHEET = '서비스신청';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// Private Key: Base64 인코딩 방식 우선, 없으면 기존 방식 사용
function getPrivateKey(): string | undefined {
  // Base64 인코딩된 키가 있으면 디코딩
  if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
    try {
      return Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
    } catch (e) {
      logger.error('Failed to decode GOOGLE_PRIVATE_KEY_BASE64', {}, e instanceof Error ? e : undefined);
    }
  }
  // 기존 방식 (\\n을 실제 줄바꿈으로 변환)
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

const PRIVATE_KEY = getPrivateKey();

// 시트 헤더 정의
export const SHEET_HEADERS = [
  // 식별 & 시간
  'id',
  'createdAt',          // 세션 시작 (온보딩 진입)
  'updatedAt',          // 마지막 활동
  'diagnosisStartedAt', // 진단 시작 시간
  'diagnosisEndedAt',   // 진단 완료 시간
  'diagnosisDuration',  // 진단 소요 시간 (초)

  // 상태 & 방문
  'status',
  'lastQuestionIndex',
  'visitCount',

  // 유입 경로
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'referrer',           // 유입 URL

  // 디바이스 정보
  'deviceType',         // mobile/desktop/tablet
  'browser',
  'screenWidth',

  // 사용자 정보
  'nickname',
  'company',
  'department',
  'jobRole',
  'email',
  'agreedToTerms',

  // 진단 결과
  'answers',
  'scoreGrowth',
  'scoreSharing',
  'scoreInteraction',
  'leadershipType',
  'concerns',

  // 팀 & 서비스
  'teamMembers',
  'selectedServices',
];

// Google Sheets 인증
function getAuth() {
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Sheets API 인스턴스
function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// 컬럼 인덱스를 A, B, ..., Z, AA, AB 형식으로 변환
function getColumnLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

// 마지막 컬럼 문자 가져오기
function getLastColumnLetter(): string {
  return getColumnLetter(SHEET_HEADERS.length - 1);
}

// 시트 초기화 (헤더 추가)
export async function initializeSheet() {
  const sheets = getSheets();

  try {
    // 기존 데이터 확인 (헤더 수에 맞게 range 설정)
    const lastCol = getLastColumnLetter();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `A1:${lastCol}1`,
    });

    // 헤더가 없으면 추가
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [SHEET_HEADERS],
        },
      });
      logger.info('Sheet headers initialized');
    }
  } catch (error) {
    logger.error('Failed to initialize sheet', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// 헤더별 설명 (메모용)
const HEADER_DESCRIPTIONS: Record<string, string> = {
  id: '세션 고유 ID (UUID)',
  createdAt: '세션 시작 시간 (온보딩 진입)',
  updatedAt: '마지막 활동 시간',
  diagnosisStartedAt: '진단 시작 시간',
  diagnosisEndedAt: '진단 완료 시간',
  diagnosisDuration: '진단 소요 시간 (초)',
  status: '진행 상태: onboarding, diagnosis, concerns, profile, team, completed',
  lastQuestionIndex: '마지막 응답 문항 번호 (1-23)',
  visitCount: '방문 횟수 (1=첫방문, 2+=재방문)',
  utmSource: 'UTM 소스 (유입 채널)',
  utmMedium: 'UTM 매체 (광고, 이메일 등)',
  utmCampaign: 'UTM 캠페인명',
  referrer: '유입 URL (이전 페이지)',
  deviceType: '디바이스: mobile, desktop, tablet',
  browser: '브라우저: Chrome, Safari, Firefox 또는 인앱(KakaoTalk, Line, Naver 등)',
  screenWidth: '화면 너비 (px)',
  nickname: '사용자 닉네임',
  company: '회사명',
  department: '부서',
  jobRole: '직무: 마케팅, 기획, 경영지원, 개발, 디자인, 기타',
  email: '이메일 주소',
  agreedToTerms: '개인정보 수집 동의 여부',
  answers: '문항별 응답 (JSON): {문항ID: 점수}',
  scoreGrowth: '성장지향 점수',
  scoreSharing: '공유지향 점수',
  scoreInteraction: '상호작용 점수',
  leadershipType: '리더십 유형 코드 (L01-L08)',
  concerns: '선택한 고민 키워드 (JSON 배열)',
  teamMembers: '팀원 정보 (JSON): [{name, type}]',
  selectedServices: '신청한 케어 서비스 (JSON 배열)',
};

// 시트 헤더 강제 업데이트
export async function updateSheetHeaders() {
  const sheets = getSheets();
  const lastCol = getLastColumnLetter();

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `A1:${lastCol}1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [SHEET_HEADERS],
      },
    });
    logger.info('Sheet headers updated');
    return { success: true, headers: SHEET_HEADERS };
  } catch (error) {
    logger.error('Failed to update sheet headers', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// 서비스 신청 시트 헤더
export const SERVICE_REQUEST_HEADERS = [
  'id',              // 세션 ID (assessment와 연결)
  'requestedAt',     // 신청 일시
  'nickname',        // 닉네임
  'email',           // 이메일
  'company',         // 회사
  'department',      // 부서
  'jobRole',         // 직무
  'leadershipType',  // 리더십 유형
  'services',        // 신청 서비스 (쉼표 구분)
  'status',          // 처리 상태 (pending, contacted, completed)
  'note',            // 메모
];

// 서비스 신청 헤더 설명
export const SERVICE_REQUEST_HEADER_DESCRIPTIONS: Record<string, string> = {
  id: '세션 ID (진단데이터 시트와 연결)',
  requestedAt: '서비스 신청 일시 (ISO 8601)',
  nickname: '사용자 닉네임',
  email: '이메일 주소',
  company: '회사명',
  department: '부서',
  jobRole: '직무',
  leadershipType: '리더십 유형 코드 (L01-L08)',
  services: '신청한 서비스 목록 (쉼표 구분)',
  status: '처리 상태: pending(대기), contacted(연락완료), completed(완료)',
  note: '관리자 메모',
};

// 서비스 신청 저장
export async function saveServiceRequest(data: {
  id: string;          // 세션 ID
  nickname?: string;
  email?: string;
  company?: string;
  department?: string;
  jobRole?: string;
  leadershipType?: string;
  services: string[];
}) {
  const sheets = getSheets();

  try {
    // 시트 존재 여부 확인 및 생성
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === SERVICE_REQUEST_SHEET
    );

    if (!sheetExists) {
      // 시트 생성
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SERVICE_REQUEST_SHEET,
                },
              },
            },
          ],
        },
      });

      // 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SERVICE_REQUEST_SHEET}!A1:K1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SERVICE_REQUEST_HEADERS],
        },
      });
    }

    // 서비스 이름 매핑
    const serviceNames: Record<string, string> = {
      team_diagnosis_link: '팀 진단 Link 발송',
      expert_consultation: '전문가 1:1 상담',
      team_workshop: '팀 마인드 케어 워크숍',
      team_solution: '팀 이슈 케어 솔루션',
    };

    const servicesText = data.services
      .map((s) => serviceNames[s] || s)
      .join(', ');

    // 데이터 추가
    const row = [
      data.id,                             // id (세션 ID)
      getKoreanTime(),                     // requestedAt (한국 시간)
      data.nickname || '',                 // nickname
      data.email || '',                    // email
      data.company || '',                  // company
      data.department || '',               // department
      data.jobRole || '',                  // jobRole
      data.leadershipType || '',           // leadershipType
      servicesText,                        // services
      'pending',                           // status
      '',                                  // note
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SERVICE_REQUEST_SHEET}!A:K`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    logger.info('Service request saved');
    return { success: true };
  } catch (error) {
    logger.error('Failed to save service request', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// 헤더에 메모 추가
export async function addHeaderNotes() {
  const sheets = getSheets();

  try {
    // 각 헤더 셀에 메모 추가하는 요청 생성
    const requests = SHEET_HEADERS.map((header, index) => ({
      updateCells: {
        range: {
          sheetId: 0, // 첫 번째 시트
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: index,
          endColumnIndex: index + 1,
        },
        rows: [
          {
            values: [
              {
                note: HEADER_DESCRIPTIONS[header] || header,
              },
            ],
          },
        ],
        fields: 'note',
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests,
      },
    });

    logger.info('Header notes added');
    return { success: true, count: SHEET_HEADERS.length };
  } catch (error) {
    logger.error('Failed to add header notes', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// 데이터 추가 (새 행)
export async function appendRow(data: Record<string, unknown>) {
  const sheets = getSheets();
  const lastCol = getLastColumnLetter();

  const row = SHEET_HEADERS.map((header) => {
    const value = data[header];
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `A:${lastCol}`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to append row', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// ID로 행 찾기 (행 번호와 기존 데이터 반환)
export async function findRowById(id: string): Promise<{ rowNumber: number; data: Record<string, string> } | null> {
  const sheets = getSheets();
  const lastCol = getLastColumnLetter();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `A:${lastCol}`,
    });

    const rows = response.data.values;
    if (!rows) return null;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        // 기존 데이터를 객체로 변환
        const data: Record<string, string> = {};
        SHEET_HEADERS.forEach((header, index) => {
          data[header] = rows[i][index] || '';
        });
        return { rowNumber: i + 1, data }; // 1-indexed
      }
    }
    return null;
  } catch (error) {
    logger.error('Failed to find row', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// 행 업데이트
export async function updateRow(rowNumber: number, data: Record<string, unknown>) {
  const sheets = getSheets();
  const lastCol = getLastColumnLetter();

  const row = SHEET_HEADERS.map((header) => {
    const value = data[header];
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `A${rowNumber}:${lastCol}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to update row', {}, error instanceof Error ? error : undefined);
    throw error;
  }
}

// ID로 업데이트 또는 새로 추가 (upsert)
export async function upsertAssessment(data: Record<string, unknown>) {
  const id = data.id as string;

  if (!id) {
    throw new Error('ID is required');
  }

  const existing = await findRowById(id);

  if (existing) {
    // 기존 데이터와 병합 (빈 값은 기존 값 유지)
    const mergedData = { ...data };

    // 기존 값 유지 (새 데이터가 없는 필드)
    SHEET_HEADERS.forEach((header) => {
      if ((mergedData[header] === undefined || mergedData[header] === '') && existing.data[header]) {
        // answers, concerns, teamMembers, selectedServices는 JSON 파싱
        if (['answers', 'concerns', 'teamMembers', 'selectedServices'].includes(header) && existing.data[header]) {
          try {
            mergedData[header] = JSON.parse(existing.data[header]);
          } catch {
            mergedData[header] = existing.data[header];
          }
        } else {
          mergedData[header] = existing.data[header];
        }
      }
    });

    return await updateRow(existing.rowNumber, mergedData);
  } else {
    // 새 레코드
    return await appendRow(data);
  }
}
