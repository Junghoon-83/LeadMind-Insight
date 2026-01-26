import { NextRequest, NextResponse } from 'next/server';
import { upsertAssessment, initializeSheet } from '@/lib/googleSheets';

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

    // 타임스탬프 추가
    const now = new Date().toISOString();
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
