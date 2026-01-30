import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET || 'leadmind-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Rate Limiting 설정
const LOGIN_ATTEMPTS_LIMIT = 5;
const LOGIN_WINDOW_MS = 60 * 1000; // 1분

// 메모리 기반 Rate Limiter (프로덕션에서는 Redis 권장)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export interface JWTPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWT 토큰 생성
 */
export function generateToken(): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    role: 'admin',
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Rate Limiting 체크
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  // 기존 시도가 없거나 윈도우가 지났으면 리셋
  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true, remainingAttempts: LOGIN_ATTEMPTS_LIMIT - 1 };
  }

  // 제한 초과 체크
  if (attempt.count >= LOGIN_ATTEMPTS_LIMIT) {
    const waitTime = Math.ceil((attempt.resetAt - now) / 1000);
    return { allowed: false, remainingAttempts: 0 };
  }

  // 시도 횟수 증가
  attempt.count++;
  loginAttempts.set(identifier, attempt);
  return { allowed: true, remainingAttempts: LOGIN_ATTEMPTS_LIMIT - attempt.count };
}

/**
 * Rate Limit 실패 시 대기 시간 계산
 */
export function getRateLimitWaitTime(identifier: string): number {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) return 0;

  const waitTime = Math.ceil((attempt.resetAt - now) / 1000);
  return waitTime > 0 ? waitTime : 0;
}

/**
 * Rate Limit 리셋 (로그인 성공 시)
 */
export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * 환경변수 검증
 */
export function validateAuthEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.ADMIN_PASSWORD_HASH) {
    // ADMIN_PASSWORD가 있으면 해시 생성을 위한 안내
    if (process.env.ADMIN_PASSWORD) {
      logger.warn('ADMIN_PASSWORD is set but ADMIN_PASSWORD_HASH is not. Run `npm run hash-password` to generate a hash.');
    } else {
      errors.push('ADMIN_PASSWORD_HASH environment variable is required');
    }
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'leadmind-jwt-secret-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET must be set to a secure value in production');
    } else {
      logger.warn('Using default JWT_SECRET. Set a secure value in production.');
    }
  }

  return { valid: errors.length === 0, errors };
}
