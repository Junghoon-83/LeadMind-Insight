import { NextRequest, NextResponse } from 'next/server';
import { upsertAssessment, initializeSheet, updateSheetHeaders, addHeaderNotes, SHEET_HEADERS } from '@/lib/googleSheets';

// 한국 시간 포맷 (YYYY-MM-DD HH:mm:ss)
function getKoreanTime(): string {
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

// 시트 초기화 (서버 시작 시 한 번만)
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await initializeSheet();
    isInitialized = true;
  }
}

// POST: 진단 데이터 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();

    // 필수 필드 검증
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // 타임스탬프 추가 (한국 시간)
    const now = getKoreanTime();
    const data = {
      ...body,
      updatedAt: now,
      createdAt: body.createdAt || now,
    };

    await upsertAssessment(data);

    return NextResponse.json({ success: true, id: body.id });
  } catch (error) {
    console.error('Assessment save error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

// PUT: 시트 헤더 업데이트 (관리자용)
export async function PUT(request: NextRequest) {
  try {
    // 간단한 인증 (쿼리 파라미터로 키 확인)
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    const action = searchParams.get('action') || 'headers';

    if (adminKey !== 'update-headers-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (action === 'notes') {
      // 헤더에 메모 추가
      await addHeaderNotes();
      return NextResponse.json({
        success: true,
        message: 'Header notes added',
        count: SHEET_HEADERS.length,
      });
    }

    // 기본: 헤더 업데이트
    await updateSheetHeaders();

    return NextResponse.json({
      success: true,
      message: 'Headers updated',
      headers: SHEET_HEADERS,
      count: SHEET_HEADERS.length,
    });
  } catch (error) {
    console.error('Header update error:', error);
    return NextResponse.json(
      { error: 'Failed to update headers' },
      { status: 500 }
    );
  }
}
