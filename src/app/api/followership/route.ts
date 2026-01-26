import { NextResponse } from 'next/server';
import { followershipTypes, compatibilityData } from '@/data/followershipTypes';

// GET - Fetch followership types and compatibility data
// 정적 데이터 사용 (빠른 응답)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeCompatibility = searchParams.get('includeCompatibility') === 'true';

  const response: Record<string, unknown> = { followershipTypes };
  if (includeCompatibility) {
    response.compatibilityData = compatibilityData;
  }

  return NextResponse.json(response);
}
