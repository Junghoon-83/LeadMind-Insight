/**
 * 구조화된 로깅 유틸리티
 *
 * 프로덕션에서는 Winston, Pino 등의 라이브러리로 교체 권장
 * 이 구현은 개발 환경 및 기본 프로덕션 로깅을 위한 것
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 환경에 따른 최소 로그 레벨
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/**
 * 로그 엔트리 포맷팅
 */
function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형식
    return JSON.stringify(entry);
  }

  // 개발: 읽기 좋은 형식
  const { level, message, timestamp, context, error } = entry;
  let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  if (context && Object.keys(context).length > 0) {
    output += ` ${JSON.stringify(context)}`;
  }

  if (error) {
    output += `\n  Error: ${error.name} - ${error.message}`;
    if (error.stack && String(process.env.NODE_ENV) !== 'production') {
      output += `\n  Stack: ${error.stack}`;
    }
  }

  return output;
}

/**
 * 로그 출력
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  // 로그 레벨 필터링
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LOG_LEVEL]) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }

  // 프로덕션에서는 외부 로깅 서비스로 전송 가능
  // 예: Sentry, DataDog, CloudWatch 등
  // if (process.env.NODE_ENV === 'production' && level === 'error') {
  //   sendToExternalService(entry);
  // }
}

/**
 * Logger 인터페이스
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),
};

/**
 * API 요청 로깅 헬퍼
 */
export function logApiRequest(
  method: string,
  path: string,
  context?: LogContext
): void {
  logger.info(`API ${method} ${path}`, context);
}

/**
 * API 에러 로깅 헬퍼
 */
export function logApiError(
  method: string,
  path: string,
  error: unknown,
  context?: LogContext
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(`API ${method} ${path} failed`, context, err);
}

export default logger;
