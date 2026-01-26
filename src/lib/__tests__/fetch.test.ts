import {
  fetchWithTimeout,
  postJson,
  putJson,
  deleteRequest,
  TimeoutError,
  ApiError,
} from '../fetch';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock the logger to avoid noise
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  logApiError: jest.fn(),
}));

describe('fetch utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWithTimeout', () => {
    it('should successfully fetch data', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response);

      const result = await fetchWithTimeout('/api/test');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
    });

    it('should handle timeout', async () => {
      // Mock a slow fetch that will be aborted
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('should not reach here'));
            }, 15000);
            // Clear timeout on abort (simulating AbortController behavior)
            return { timeoutId };
          })
      );

      const result = await fetchWithTimeout('/api/test', { timeout: 100 });

      expect(result.data).toBeNull();
      expect(result.error).toContain('timed out');
      expect(result.status).toBeNull();
    }, 15000);

    it('should handle non-JSON responses', async () => {
      const mockText = 'plain text response';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => mockText,
      } as Response);

      const result = await fetchWithTimeout('/api/test');

      expect(result.data).toBe(mockText);
      expect(result.error).toBeNull();
    });

    it('should handle HTTP errors', async () => {
      const errorMessage = 'Not Found';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: errorMessage }),
      } as Response);

      const result = await fetchWithTimeout('/api/test');

      expect(result.data).toBeNull();
      expect(result.error).toBe(errorMessage);
      expect(result.status).toBe(404);
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server Error' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        } as Response);

      const result = await fetchWithTimeout('/api/test', {
        retries: 1,
        retryDelay: 10, // Very short delay for test
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    }, 10000);

    it('should not retry on 4xx errors by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' }),
      } as Response);

      const result = await fetchWithTimeout('/api/test', {
        retries: 2,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(400);
    });

    it('should use custom retry condition', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Bad Request' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        } as Response);

      const result = await fetchWithTimeout('/api/test', {
        retries: 1,
        retryDelay: 10,
        shouldRetry: () => true, // Always retry
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    }, 10000);

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchWithTimeout('/api/test');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
      expect(result.status).toBeNull();
    });

    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        } as Response);

      const result = await fetchWithTimeout('/api/test', {
        retries: 1,
        retryDelay: 10,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    }, 10000);

    it('should exhaust all retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await fetchWithTimeout('/api/test', {
        retries: 2,
        retryDelay: 10,
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result.error).toBe('Network error');
    }, 10000);
  });

  describe('postJson', () => {
    it('should make POST request with JSON body', async () => {
      const mockData = { id: 1, name: 'Test' };
      const requestBody = { name: 'Test' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response);

      const result = await postJson('/api/test', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result.data).toEqual(mockData);
    });

    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response);

      await postJson('/api/test', { name: 'Test' });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
        })
      );
    });

    it('should include custom headers along with Content-Type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response);

      await postJson(
        '/api/test',
        { name: 'Test' },
        {
          headers: {
            Authorization: 'Bearer token',
          },
        }
      );

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual(
        expect.objectContaining({
          Authorization: 'Bearer token',
        })
      );
    });
  });

  describe('putJson', () => {
    it('should make PUT request with JSON body', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const requestBody = { name: 'Updated' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response);

      const result = await putJson('/api/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result.data).toEqual(mockData);
    });
  });

  describe('deleteRequest', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      } as Response);

      const result = await deleteRequest('/api/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result.status).toBe(204);
    });

    it('should include custom options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      } as Response);

      await deleteRequest('/api/test/1', {
        headers: {
          Authorization: 'Bearer token',
        },
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual(
        expect.objectContaining({
          Authorization: 'Bearer token',
        })
      );
    });
  });

  describe('Error classes', () => {
    it('should create TimeoutError', () => {
      const error = new TimeoutError('Request timed out');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toBe('Request timed out');
    });

    it('should create ApiError with status', () => {
      const error = new ApiError('Not Found', 404);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Not Found');
      expect(error.status).toBe(404);
    });
  });
});
