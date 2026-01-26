import { NextResponse } from 'next/server';
import { questions as staticQuestions } from '@/data/questions';

// GET - Fetch active questions for diagnosis
// 정적 데이터 사용 (빠른 응답)
export async function GET() {
  return NextResponse.json({
    questions: staticQuestions,
    total: staticQuestions.length,
  });
}
