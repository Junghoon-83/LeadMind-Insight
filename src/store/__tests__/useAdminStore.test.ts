import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminStore } from '../useAdminStore';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Suppress console.error for expected error tests
const originalError = console.error;

describe('useAdminStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useAdminStore;
    act(() => {
      getState().logout();
    });
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('initial state', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => useAdminStore());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.tokenExpiresAt).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockToken = 'test-token-123';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: mockToken }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('correctpassword');
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.tokenExpiresAt).toBeDefined();
    });

    it('should handle incorrect password', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: '비밀번호가 올바르지 않습니다.',
          remainingAttempts: 3,
        }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('wrongpassword');
      });

      expect(loginResult).toEqual({
        success: false,
        error: '비밀번호가 올바르지 않습니다.',
        remainingAttempts: 3,
      });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: '너무 많은 로그인 시도입니다.',
          waitTime: 30,
        }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('password');
      });

      expect(loginResult).toEqual({
        success: false,
        error: '너무 많은 로그인 시도입니다.',
        waitTime: 30,
      });
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdminStore());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('password');
      });

      expect(loginResult).toEqual({
        success: false,
        error: '네트워크 오류가 발생했습니다.',
      });
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should send correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: 'test-token' }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      await act(async () => {
        await result.current.login('testpassword');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/auth',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'testpassword' }),
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      // First login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: 'test-token' }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      await act(async () => {
        await result.current.login('password');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.tokenExpiresAt).toBeNull();
    });
  });

  describe('verifySession', () => {
    it('should return false when no token', async () => {
      const { result } = renderHook(() => useAdminStore());

      let isValid;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false when token is expired', async () => {
      const { result } = renderHook(() => useAdminStore());

      // Set expired token
      act(() => {
        useAdminStore.setState({
          token: 'expired-token',
          tokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
          isAuthenticated: true,
        });
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('should verify valid token with server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: true, role: 'admin' }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      // Set valid token
      act(() => {
        useAdminStore.setState({
          token: 'valid-token',
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          isAuthenticated: false,
        });
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/auth',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );
    });

    it('should handle invalid token from server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ valid: false, error: 'Invalid token' }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      // Set token
      act(() => {
        useAdminStore.setState({
          token: 'invalid-token',
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          isAuthenticated: true,
        });
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      expect(isValid).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('should maintain state on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdminStore());

      // Set authenticated state
      act(() => {
        useAdminStore.setState({
          token: 'valid-token',
          tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          isAuthenticated: true,
        });
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.verifySession();
      });

      // Should maintain previous state on network error
      expect(isValid).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('getAuthHeader', () => {
    it('should return Authorization header with token', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        useAdminStore.setState({
          token: 'test-token-123',
        });
      });

      const header = result.current.getAuthHeader();

      expect(header).toEqual({
        Authorization: 'Bearer test-token-123',
      });
    });

    it('should return empty object when no token', () => {
      const { result } = renderHook(() => useAdminStore());

      const header = result.current.getAuthHeader();

      expect(header).toEqual({});
    });
  });

  describe('state management', () => {
    it('should manage authentication state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: 'test-token' }),
      } as Response);

      const { result } = renderHook(() => useAdminStore());

      // Start not authenticated
      expect(result.current.isAuthenticated).toBe(false);

      await act(async () => {
        await result.current.login('password');
      });

      // Now authenticated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('test-token');
    });

    it('should clear state on logout', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        useAdminStore.setState({
          token: 'test-token',
          isAuthenticated: true,
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });
  });
});
