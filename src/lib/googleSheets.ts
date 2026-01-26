import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// 시트 헤더 정의
export const SHEET_HEADERS = [
  'id',
  'createdAt',
  'updatedAt',
  'status',
  'lastQuestionIndex',
  'nickname',
  'company',
  'department',
  'jobRole',
  'email',
  'agreedToTerms',
  'answers',
  'scoreGrowth',
  'scoreSharing',
  'scoreInteraction',
  'leadershipType',
  'concerns',
  'teamMembers',
  'selectedServices',
  'utmSource',
  'utmMedium',
  'utmCampaign',
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

// 시트 초기화 (헤더 추가)
export async function initializeSheet() {
  const sheets = getSheets();

  try {
    // 기존 데이터 확인
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1:V1',
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
      console.log('Sheet headers initialized');
    }
  } catch (error) {
    console.error('Failed to initialize sheet:', error);
    throw error;
  }
}

// 데이터 추가 (새 행)
export async function appendRow(data: Record<string, unknown>) {
  const sheets = getSheets();

  const row = SHEET_HEADERS.map((header) => {
    const value = data[header];
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:V',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to append row:', error);
    throw error;
  }
}

// ID로 행 찾기
export async function findRowById(id: string): Promise<number | null> {
  const sheets = getSheets();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:A',
    });

    const rows = response.data.values;
    if (!rows) return null;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        return i + 1; // 1-indexed
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to find row:', error);
    throw error;
  }
}

// 행 업데이트
export async function updateRow(rowNumber: number, data: Record<string, unknown>) {
  const sheets = getSheets();

  const row = SHEET_HEADERS.map((header) => {
    const value = data[header];
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `A${rowNumber}:V${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update row:', error);
    throw error;
  }
}

// ID로 업데이트 또는 새로 추가 (upsert)
export async function upsertAssessment(data: Record<string, unknown>) {
  const id = data.id as string;

  if (!id) {
    throw new Error('ID is required');
  }

  const existingRow = await findRowById(id);

  if (existingRow) {
    return await updateRow(existingRow, data);
  } else {
    return await appendRow(data);
  }
}
