import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { logger } from '@/lib/logger';
import { SERVICE_REQUEST_HEADERS, SERVICE_REQUEST_HEADER_DESCRIPTIONS } from '@/lib/googleSheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_REQUEST_SHEET = '서비스신청';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// Private Key: Base64 인코딩 방식 우선, 없으면 기존 방식 사용
function getPrivateKey(): string | undefined {
  if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
    try {
      return Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
    } catch {
      // Base64 디코딩 실패 시 기존 방식 사용
    }
  }
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

const PRIVATE_KEY = getPrivateKey();

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
                note: SERVICE_REQUEST_HEADER_DESCRIPTIONS[header] || header,
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
    logger.error('Failed to update service request headers', {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update headers', details: String(error) },
      { status: 500 }
    );
  }
}
