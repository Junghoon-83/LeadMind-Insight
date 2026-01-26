'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * 클라이언트 사이드 프로바이더 래퍼
 * - Error Boundary
 * - 추후 추가될 Context Providers
 */
export default function Providers({ children }: ProvidersProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
