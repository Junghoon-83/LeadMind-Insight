import { NextResponse } from 'next/server';
import { concerns as staticConcerns } from '@/data/concerns';

// GET - Fetch active concerns
// 정적 데이터 사용 (빠른 응답)
export async function GET() {
  return NextResponse.json({ concerns: staticConcerns });
}
