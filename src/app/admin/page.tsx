'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, verifySession } = useAdminStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 세션 검증
  useEffect(() => {
    const checkSession = async () => {
      const valid = await verifySession();
      if (valid) {
        router.replace('/admin/questions');
      }
    };
    checkSession();
  }, [verifySession, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/questions');
    }
  }, [isAuthenticated, router]);

  // Rate Limit 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      router.replace('/admin/questions');
    } else {
      // Rate Limited
      if (result.waitTime) {
        setCountdown(result.waitTime);
        setError(result.error || '너무 많은 시도입니다.');
      } else if (result.remainingAttempts !== undefined) {
        setError(`${result.error} (남은 시도: ${result.remainingAttempts}회)`);
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    }

    setLoading(false);
  };

  const isDisabled = loading || !password || countdown > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--color-background)] to-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-violet-100)] flex items-center justify-center">
            <Lock className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            관리자 로그인
          </h1>
          <p className="text-[var(--color-gray-600)] mt-2">
            콘텐츠 관리를 위해 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={countdown > 0}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center text-[var(--color-gray-500)] text-sm">
              {countdown}초 후에 다시 시도할 수 있습니다
            </div>
          )}

          <Button fullWidth type="submit" disabled={isDisabled}>
            {loading ? '로그인 중...' : countdown > 0 ? `대기 중 (${countdown}s)` : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
