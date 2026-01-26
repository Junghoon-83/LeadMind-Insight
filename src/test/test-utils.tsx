import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with common providers
 * Add providers here as needed (e.g., ThemeProvider, QueryClientProvider, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add custom wrapper here if needed
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock fetch response helper
 */
export function mockFetchResponse(data: any, options: Partial<Response> = {}) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    ...options,
  } as Response;
}

/**
 * Mock fetch error helper
 */
export function mockFetchError(
  message: string,
  status: number = 500,
  errorData?: any
) {
  return {
    ok: false,
    status,
    statusText: message,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => errorData || { error: message },
    text: async () => JSON.stringify(errorData || { error: message }),
  } as Response;
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
}

/**
 * Create mock NextRequest
 */
export function createMockNextRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  json?: () => Promise<any>;
}): any {
  const headers = new Headers(options.headers || {});

  return {
    method: options.method || 'GET',
    url: options.url || 'http://localhost:3000/api/test',
    headers,
    json: options.json || (async () => options.body),
  };
}

/**
 * Create test data factory
 */
export function createFactory<T>(defaults: T) {
  return (overrides: Partial<T> = {}): T => {
    return { ...defaults, ...overrides };
  };
}

/**
 * Create multiple test data items
 */
export function createList<T>(
  factory: (index: number) => T,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

/**
 * Test data generators
 */
export const testData = {
  user: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01').toISOString(),
  }),

  leadershipType: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'L01',
    name: '리더십 유형',
    title: '리더십 타이틀',
    description: '리더십 설명',
    strengths: ['강점 1', '강점 2'],
    challenges: ['도전 과제 1'],
    image: null,
    sortOrder: 1,
    isActive: true,
  }),

  followershipType: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'F01',
    name: '팔로워십 유형',
    title: '팔로워십 타이틀',
    description: '팔로워십 설명',
    icon: '⭐',
    sortOrder: 1,
    isActive: true,
  }),

  question: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'Q01',
    text: '문항 내용입니다.',
    category: 'growth' as const,
    subcategory: null,
    sortOrder: 1,
    isActive: true,
  }),

  concern: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'C01',
    label: '고민 라벨',
    categories: ['E', 'G'],
    groupName: '그룹명',
    sortOrder: 1,
    isActive: true,
  }),

  solution: createFactory({
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'P01',
    combination: 'E+G',
    title: '솔루션 타이틀',
    coreIssue: '핵심 이슈',
    fieldVoices: ['현장 목소리 1'],
    diagnosis: '진단 내용',
    sortOrder: 1,
    isActive: true,
  }),
};

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  const mocks = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
    debug: jest.spyOn(console, 'debug').mockImplementation(),
  };

  const restore = () => {
    Object.entries(originalConsole).forEach(([key, value]) => {
      console[key as keyof typeof originalConsole] = value;
    });
  };

  return { mocks, restore };
}

/**
 * Advance timers and flush promises
 */
export async function advanceTimersAndFlush(ms: number) {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
}

/**
 * Test environment helpers
 */
export const testEnv = {
  setNodeEnv(env: string) {
    (process.env as Record<string, string>).NODE_ENV = env;
  },

  resetNodeEnv() {
    (process.env as Record<string, string>).NODE_ENV = 'test';
  },

  setEnvVar(key: string, value: string) {
    process.env[key] = value;
  },

  deleteEnvVar(key: string) {
    delete process.env[key];
  },
};

/**
 * Common test assertions
 */
export const assertions = {
  expectToBeValidUUID(value: string) {
    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  },

  expectToBeValidJWT(token: string) {
    expect(token.split('.')).toHaveLength(3);
  },

  expectToBeValidISO8601(dateString: string) {
    expect(new Date(dateString).toISOString()).toBe(dateString);
  },

  expectToHaveBeenCalledWithMatching(
    mock: jest.Mock,
    matcher: (args: any[]) => boolean
  ) {
    const calls = mock.mock.calls;
    const hasMatch = calls.some((callArgs) => matcher(callArgs));
    expect(hasMatch).toBe(true);
  },
};

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
