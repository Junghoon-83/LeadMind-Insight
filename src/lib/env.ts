import { z } from 'zod';

/**
 * 서버 측 환경변수 스키마
 * 서버에서만 사용하는 민감한 환경변수
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),

  // Google Sheets API
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1, 'Google Sheets Spreadsheet ID is required'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email('Invalid service account email'),
  GOOGLE_PRIVATE_KEY: z.string().min(1).optional(),
  GOOGLE_PRIVATE_KEY_BASE64: z.string().min(1).optional(),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required'),
  ADMIN_SHEET_KEY: z.string().min(1, 'ADMIN_SHEET_KEY is required'),

  // Optional
  ADMIN_PASSWORD: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
}).refine(
  (data) => data.GOOGLE_PRIVATE_KEY || data.GOOGLE_PRIVATE_KEY_BASE64,
  {
    message: 'Either GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_BASE64 must be set',
    path: ['GOOGLE_PRIVATE_KEY'],
  }
);

/**
 * 클라이언트 측 환경변수 스키마 (NEXT_PUBLIC_ 접두사)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

/**
 * 환경변수 검증 결과
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * 서버 환경변수 검증 및 반환
 * 빌드 시점에서 에러를 발생시키지 않도록 lazy 검증
 */
let _serverEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // 개발 환경에서는 경고만, 프로덕션에서는 에러
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed:\n${errors}`);
    } else {
      console.warn(`⚠️ Environment validation warnings:\n${errors}`);
      // 개발 환경에서는 부분적으로 파싱된 값 사용
      _serverEnv = result.data as unknown as ServerEnv;
      return _serverEnv;
    }
  }

  _serverEnv = result.data;
  return _serverEnv;
}

/**
 * 클라이언트 환경변수 검증 및 반환
 */
let _clientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;

  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    console.warn('Client environment validation failed:', result.error.issues);
  }

  _clientEnv = result.data ?? {};
  return _clientEnv;
}

/**
 * 환경변수 검증 유틸리티
 * 서버 시작 시 호출하여 모든 필수 환경변수 검증
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const serverResult = serverEnvSchema.safeParse(process.env);
  if (!serverResult.success) {
    serverResult.error.issues.forEach((issue) => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
