import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  generateToken,
  verifyToken,
  checkRateLimit,
  getRateLimitWaitTime,
  resetRateLimit,
  extractToken,
} from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/auth - 관리자 로그인
 */
export async function POST(request: Request) {
  try {
    // 클라이언트 IP 추출 (Rate Limiting용)
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Rate Limiting 체크
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      const waitTime = getRateLimitWaitTime(clientIP);
      return NextResponse.json(
        {
          error: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.',
          waitTime,
        },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    // 1. ADMIN_PASSWORD_HASH 환경변수가 있으면 해시 비교
    // 2. 없으면 ADMIN_PASSWORD와 직접 비교 (개발 환경용)
    let isValid = false;

    if (process.env.ADMIN_PASSWORD_HASH) {
      // 프로덕션: 해시된 비밀번호와 비교
      isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    } else if (process.env.ADMIN_PASSWORD) {
      // 개발: 평문 비밀번호와 비교 (프로덕션에서는 사용하지 않음)
      if (process.env.NODE_ENV === 'production') {
        logger.error('CRITICAL: Using plain password in production is not allowed', { clientIP });
        return NextResponse.json(
          { error: '서버 설정 오류입니다.' },
          { status: 500 }
        );
      }
      isValid = password === process.env.ADMIN_PASSWORD;
    } else {
      // 환경변수 없음 - 비밀번호 설정 필요
      logger.error('CRITICAL: No admin password configured (ADMIN_PASSWORD or ADMIN_PASSWORD_HASH required)', { clientIP });
      return NextResponse.json(
        { error: '서버 설정 오류입니다. 관리자 비밀번호가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    if (!isValid) {
      // 로그인 실패 로그 (보안 모니터링용)
      logger.warn('Failed login attempt', { clientIP, remainingAttempts: rateCheck.remainingAttempts });
      return NextResponse.json(
        {
          error: '비밀번호가 올바르지 않습니다.',
          remainingAttempts: rateCheck.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 로그인 성공 - Rate Limit 리셋
    resetRateLimit(clientIP);

    // JWT 토큰 생성
    const token = generateToken();

    logger.info('Successful admin login', { clientIP });

    return NextResponse.json({
      success: true,
      token,
      expiresIn: '24h',
    });
  } catch (error) {
    logger.error('Login error', {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth - 토큰 검증 (세션 확인)
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { valid: false, error: '토큰이 없습니다.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { valid: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      role: payload.role,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
  } catch (error) {
    logger.error('Token verification error', {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { valid: false, error: '토큰 검증 실패' },
      { status: 500 }
    );
  }
}
