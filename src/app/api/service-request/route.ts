import { NextRequest, NextResponse } from 'next/server';
import { saveServiceRequest } from '@/lib/googleSheets';

// POST: 서비스 신청 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    if (!body.services || body.services.length === 0) {
      return NextResponse.json(
        { error: 'Services are required' },
        { status: 400 }
      );
    }

    await saveServiceRequest({
      id: body.id,
      nickname: body.nickname,
      email: body.email,
      company: body.company,
      department: body.department,
      jobRole: body.jobRole,
      leadershipType: body.leadershipType,
      services: body.services,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service request save error:', error);
    return NextResponse.json(
      { error: 'Failed to save service request' },
      { status: 500 }
    );
  }
}
