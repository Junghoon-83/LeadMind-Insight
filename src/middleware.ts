import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// JWT Secret 설정
const DEFAULT_JWT_SECRET = 'leadmind-jwt-secret-change-in-production';

function getJwtSecret(): Uint8Array {
  const jwtSecretValue = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

  // 프로덕션 환경에서 기본 JWT_SECRET 사용 방지 (런타임 체크)
  if (process.env.NODE_ENV === 'production' && jwtSecretValue === DEFAULT_JWT_SECRET) {
    console.error('🚨 SECURITY ERROR: JWT_SECRET must be set in production');
  }

  return new TextEncoder().encode(jwtSecretValue);
}

/**
 * Authorization 헤더에서 토큰 추출
 */
function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * JWT 토큰 검증 (Edge Runtime 호환 - jose 사용)
 */
async function verifyToken(token: string): Promise<{ role: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return payload as { role: string };
  } catch {
    return null;
  }
}

/**
 * Next.js 미들웨어
 * - Admin API 라우트 보호
 * - 인증이 필요한 API 요청 검증
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin API 라우트 보호 (/api/admin/* 단, /api/admin/auth는 제외)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    // 토큰이 없는 경우
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다. 로그인 후 다시 시도해주세요.' },
        { status: 401 }
      );
    }

    // 토큰 검증
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: '인증 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 인증 성공 - 요청 계속 진행
    return NextResponse.next();
  }

  // 다른 요청은 그대로 진행
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    // Admin API 라우트
    '/api/admin/:path*',
  ],
};
