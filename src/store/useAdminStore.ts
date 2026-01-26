import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  tokenExpiresAt: string | null;
  login: (password: string) => Promise<{ success: boolean; error?: string; remainingAttempts?: number; waitTime?: number }>;
  logout: () => void;
  verifySession: () => Promise<boolean>;
  getAuthHeader: () => Record<string, string>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      tokenExpiresAt: null,

      login: async (password: string) => {
        try {
          const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });

          const data = await response.json();

          if (response.status === 429) {
            // Rate Limited
            return {
              success: false,
              error: data.error,
              waitTime: data.waitTime,
            };
          }

          if (!response.ok) {
            return {
              success: false,
              error: data.error || '로그인에 실패했습니다.',
              remainingAttempts: data.remainingAttempts,
            };
          }

          // 로그인 성공
          set({
            isAuthenticated: true,
            token: data.token,
            tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });

          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return {
            success: false,
            error: '네트워크 오류가 발생했습니다.',
          };
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          tokenExpiresAt: null,
        });
      },

      verifySession: async () => {
        const { token, tokenExpiresAt } = get();

        // 토큰이 없으면 인증 실패
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        // 토큰 만료 체크 (클라이언트 측)
        if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
          set({
            isAuthenticated: false,
            token: null,
            tokenExpiresAt: null,
          });
          return false;
        }

        try {
          // 서버에서 토큰 검증
          const response = await fetch('/api/admin/auth', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok || !data.valid) {
            set({
              isAuthenticated: false,
              token: null,
              tokenExpiresAt: null,
            });
            return false;
          }

          // 토큰 유효
          set({ isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Session verification error:', error);
          // 네트워크 오류 시 기존 상태 유지
          return get().isAuthenticated;
        }
      },

      getAuthHeader: (): Record<string, string> => {
        const { token } = get();
        if (!token) return {} as Record<string, string>;
        return { Authorization: `Bearer ${token}` };
      },
    }),
    {
      name: 'leadmind-admin',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);
