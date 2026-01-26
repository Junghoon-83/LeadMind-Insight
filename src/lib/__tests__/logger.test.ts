import { logger, logApiRequest, logApiError } from '../logger';

describe('logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('logger.debug', () => {
    it('should log debug message', () => {
      logger.debug('Debug message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      const logOutput = consoleDebugSpy.mock.calls[0][0];
      expect(logOutput).toContain('DEBUG');
      expect(logOutput).toContain('Debug message');
    });

    it('should log debug message with context', () => {
      logger.debug('Debug message', { userId: 123, action: 'test' });

      expect(consoleDebugSpy).toHaveBeenCalled();
      const logOutput = consoleDebugSpy.mock.calls[0][0];
      expect(logOutput).toContain('userId');
      expect(logOutput).toContain('123');
    });
  });

  describe('logger.info', () => {
    it('should log info message', () => {
      logger.info('Info message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('INFO');
      expect(logOutput).toContain('Info message');
    });

    it('should log info message with context', () => {
      logger.info('User logged in', { userId: 'user123', ip: '127.0.0.1' });

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('User logged in');
      expect(logOutput).toContain('userId');
    });

    it('should include timestamp', () => {
      logger.info('Test message');

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe('logger.warn', () => {
    it('should log warning message', () => {
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      expect(logOutput).toContain('WARN');
      expect(logOutput).toContain('Warning message');
    });

    it('should log warning with context', () => {
      logger.warn('Rate limit approaching', { remaining: 5, limit: 100 });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      expect(logOutput).toContain('Rate limit approaching');
      expect(logOutput).toContain('remaining');
    });
  });

  describe('logger.error', () => {
    it('should log error message', () => {
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('ERROR');
      expect(logOutput).toContain('Error message');
    });

    it('should log error with context', () => {
      logger.error('Database error', { query: 'SELECT * FROM users' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Database error');
      expect(logOutput).toContain('query');
    });

    it('should log error with Error object', () => {
      const error = new Error('Something went wrong');
      error.stack = 'Error: Something went wrong\n    at test.js:1:1';

      logger.error('Operation failed', { operation: 'test' }, error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Operation failed');
      expect(logOutput).toContain('Something went wrong');
      expect(logOutput).toContain('Error:');
    });

    it('should include error stack in non-production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      logger.error('Error occurred', {}, error);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Stack:');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logApiRequest', () => {
    it('should log API request with method and path', () => {
      logApiRequest('GET', '/api/users');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('API GET /api/users');
    });

    it('should log API request with context', () => {
      logApiRequest('POST', '/api/users', { userId: 123 });

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('API POST /api/users');
      expect(logOutput).toContain('userId');
    });
  });

  describe('logApiError', () => {
    it('should log API error with method and path', () => {
      const error = new Error('API error');
      logApiError('GET', '/api/users', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('API GET /api/users failed');
      expect(logOutput).toContain('API error');
    });

    it('should log API error with context', () => {
      const error = new Error('Database error');
      logApiError('POST', '/api/users', error, { userId: 123 });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('API POST /api/users failed');
      expect(logOutput).toContain('userId');
    });

    it('should handle non-Error objects', () => {
      logApiError('GET', '/api/users', 'String error');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('API GET /api/users failed');
      expect(logOutput).toContain('String error');
    });
  });

  describe('log levels', () => {
    // Note: MIN_LOG_LEVEL is determined at module load time based on NODE_ENV.
    // In test environment (NODE_ENV=test), the minimum level is 'debug'.
    it('should log all levels in test environment', () => {
      // All log levels should work in test environment
      logger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();

      logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalled();

      logger.warn('Warn message');
      expect(consoleWarnSpy).toHaveBeenCalled();

      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('log formatting', () => {
    it('should format logs as JSON in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.info('Test message', { key: 'value' });

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();

      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test message');
      expect(parsed.context.key).toBe('value');
      expect(parsed.timestamp).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should format logs as readable text in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.info('Test message', { key: 'value' });

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('[');
      expect(logOutput).toContain('INFO');
      expect(logOutput).toContain('Test message');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('context handling', () => {
    it('should handle empty context', () => {
      logger.info('Message without context', {});

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('Message without context');
    });

    it('should handle complex context objects', () => {
      const context = {
        user: { id: 123, name: 'John' },
        metadata: { timestamp: Date.now() },
        tags: ['tag1', 'tag2'],
      };

      logger.info('Complex context', context);

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('Complex context');
      expect(logOutput).toContain('user');
    });

    it('should handle context with undefined values', () => {
      logger.info('Test', { defined: 'value', undefined: undefined });

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle context with null values', () => {
      logger.info('Test', { defined: 'value', nullValue: null });

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });
});
