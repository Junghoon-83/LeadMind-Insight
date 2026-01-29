import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_REQUEST_SHEET = '서비스신청';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const SERVICE_REQUEST_HEADERS = [
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

const HEADER_DESCRIPTIONS: Record<string, string> = {
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

function getAuth() {
  return new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function POST() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // 시트 존재 여부 확인
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SERVICE_REQUEST_SHEET
    );

    if (!sheet) {
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
    }

    // 헤더 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SERVICE_REQUEST_SHEET}!A1:K1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [SERVICE_REQUEST_HEADERS],
      },
    });

    // 시트 ID 가져오기 (메모 추가용)
    const updatedSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const updatedSheet = updatedSpreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SERVICE_REQUEST_SHEET
    );

    const sheetId = updatedSheet?.properties?.sheetId || 0;

    // 헤더에 메모 추가
    const noteRequests = SERVICE_REQUEST_HEADERS.map((header, index) => ({
      updateCells: {
        range: {
          sheetId,
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
        requests: noteRequests,
      },
    });

    return NextResponse.json({
      success: true,
      message: '서비스신청 시트 헤더가 업데이트되었습니다.',
      headers: SERVICE_REQUEST_HEADERS,
    });
  } catch (error) {
    console.error('Failed to update service request headers:', error);
    return NextResponse.json(
      { error: 'Failed to update headers', details: String(error) },
      { status: 500 }
    );
  }
}
