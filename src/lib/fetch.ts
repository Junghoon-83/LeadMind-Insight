/**
 * API 요청 유틸리티
 *
 * 타임아웃, 재시도, 에러 핸들링을 포함한 fetch 래퍼
 */

import { logger } from '@/lib/logger';

// 기본 타임아웃 (10초)
const DEFAULT_TIMEOUT = 10000;

// 재시도 기본값
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY = 1000;

interface FetchOptions extends RequestInit {
  /**
   * 요청 타임아웃 (밀리초)
   * @default 10000
   */
  timeout?: number;

  /**
   * 재시도 횟수
   * @default 0
   */
  retries?: number;

  /**
   * 재시도 간 지연 시간 (밀리초)
   * @default 1000
   */
  retryDelay?: number;

  /**
   * 재시도 조건 함수
   * @default response.status >= 500
   */
  shouldRetry?: (error: Error | null, response: Response | null) => boolean;
}

interface FetchResult<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

/**
 * 타임아웃이 적용된 Promise
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(`${operation} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * 타임아웃 에러 클래스
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * 지연 함수
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 타임아웃과 재시도를 지원하는 fetch 래퍼
 *
 * @example
 * const { data, error } = await fetchWithTimeout<User[]>('/api/users');
 *
 * @example
 * const { data, error } = await fetchWithTimeout<User>('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   timeout: 5000,
 *   retries: 2,
 * });
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    shouldRetry = (error, response) => {
      // 기본 재시도 조건: 네트워크 에러 또는 5xx 응답
      if (error) return true;
      if (response && response.status >= 500) return true;
      return false;
    },
    ...fetchOptions
  } = options;

  // AbortController 생성 (타임아웃 시 요청 취소)
  const controller = new AbortController();
  const fetchOptionsWithSignal: RequestInit = {
    ...fetchOptions,
    signal: controller.signal,
  };

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 재시도 시 로그
      if (attempt > 0) {
        logger.info(`Retrying request (attempt ${attempt + 1}/${retries + 1})`, { url });
        await delay(retryDelay * attempt); // 지수 백오프
      }

      // 타임아웃이 적용된 fetch 실행
      const response = await withTimeout(
        fetch(url, fetchOptionsWithSignal),
        timeout,
        `Fetch ${url}`
      );

      lastResponse = response;

      // 성공적인 응답 처리
      if (response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const data = await response.json();
          return { data: data as T, error: null, status: response.status };
        }

        // JSON이 아닌 경우
        const text = await response.text();
        return { data: text as unknown as T, error: null, status: response.status };
      }

      // 실패 응답
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || response.statusText;

      // 재시도 가능 여부 확인
      if (shouldRetry(null, response) && attempt < retries) {
        lastError = new ApiError(errorMessage, response.status);
        continue;
      }

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    } catch (error) {
      // AbortError는 타임아웃으로 처리됨
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new TimeoutError(`Request to ${url} was aborted`);
      } else if (error instanceof TimeoutError) {
        lastError = error;
        controller.abort(); // 타임아웃 시 요청 취소
      } else {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      // 재시도 가능 여부 확인
      if (shouldRetry(lastError, null) && attempt < retries) {
        continue;
      }

      // 재시도 불가 - 에러 반환
      logger.error('Fetch request failed', { url, attempt }, lastError);

      return {
        data: null,
        error: lastError.message,
        status: null,
      };
    }
  }

  // 모든 재시도 실패
  logger.error('All fetch retries exhausted', { url, retries }, lastError || undefined);

  return {
    data: null,
    error: lastError?.message || 'Unknown error',
    status: lastResponse?.status || null,
  };
}

/**
 * JSON POST 요청 헬퍼
 */
export async function postJson<T, D = unknown>(
  url: string,
  data: D,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * JSON PUT 요청 헬퍼
 */
export async function putJson<T, D = unknown>(
  url: string,
  data: D,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE 요청 헬퍼
 */
export async function deleteRequest<T>(
  url: string,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'DELETE',
    ...options,
  });
}

export default fetchWithTimeout;
