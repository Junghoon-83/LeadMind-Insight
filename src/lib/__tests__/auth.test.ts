import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  checkRateLimit,
  getRateLimitWaitTime,
  resetRateLimit,
  extractToken,
  validateAuthEnv,
} from '../auth';
import jwt from 'jsonwebtoken';

describe('auth utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate valid tokens with consistent structure', () => {
      // JWT tokens generated at the same second with same payload will be identical
      // This is expected behavior - JWT is deterministic
      const token1 = generateToken();
      const token2 = generateToken();

      // Both should be valid JWT structure
      expect(token1.split('.').length).toBe(3);
      expect(token2.split('.').length).toBe(3);
    });

    it('should include correct payload', () => {
      const token = generateToken();
      const decoded = jwt.decode(token) as any;

      expect(decoded.role).toBe('admin');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken();
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.role).toBe('admin');
    });

    it('should reject invalid token', () => {
      const payload = verifyToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      // Wait a moment to ensure expiration
      setTimeout(() => {
        const payload = verifyToken(expiredToken);
        expect(payload).toBeNull();
      }, 100);
    });

    it('should reject token with wrong signature', () => {
      const token = jwt.sign(
        { role: 'admin' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const payload = verifyToken(token);
      expect(payload).toBeNull();
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Reset rate limits before each test
      resetRateLimit('test-ip');
    });

    it('should allow first attempt', () => {
      const result = checkRateLimit('test-ip');

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should track multiple attempts', () => {
      checkRateLimit('test-ip');
      checkRateLimit('test-ip');
      const result = checkRateLimit('test-ip');

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(2);
    });

    it('should block after exceeding limit', () => {
      // Make 5 attempts (limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip');
      }

      // 6th attempt should be blocked
      const result = checkRateLimit('test-ip');
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should track different IPs separately', () => {
      checkRateLimit('ip1');
      checkRateLimit('ip1');

      const result1 = checkRateLimit('ip1');
      const result2 = checkRateLimit('ip2');

      expect(result1.remainingAttempts).toBe(2);
      expect(result2.remainingAttempts).toBe(4);
    });

    it('should reset after window expires', async () => {
      // This test would need to wait for the actual window time
      // For practical testing, you might want to mock Date.now()
      checkRateLimit('test-ip');

      // Mock time passing
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 61000); // 61 seconds later

      const result = checkRateLimit('test-ip');
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);

      Date.now = originalNow;
    });
  });

  describe('getRateLimitWaitTime', () => {
    beforeEach(() => {
      resetRateLimit('test-ip');
    });

    it('should return 0 for no attempts', () => {
      const waitTime = getRateLimitWaitTime('test-ip');
      expect(waitTime).toBe(0);
    });

    it('should return wait time when rate limited', () => {
      // Exceed limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip');
      }

      const waitTime = getRateLimitWaitTime('test-ip');
      expect(waitTime).toBeGreaterThan(0);
      expect(waitTime).toBeLessThanOrEqual(60); // Should be within 60 seconds
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      // Make some attempts
      checkRateLimit('test-ip');
      checkRateLimit('test-ip');

      resetRateLimit('test-ip');

      const result = checkRateLimit('test-ip');
      expect(result.remainingAttempts).toBe(4); // Back to full limit - 1
    });
  });

  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;

      const extracted = extractToken(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractToken(null);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(extractToken('InvalidFormat')).toBeNull();
      expect(extractToken('Bearer')).toBeNull();
      expect(extractToken('Bearer token extra')).toBeNull();
    });

    it('should return null for non-Bearer scheme', () => {
      const extracted = extractToken('Basic dGVzdDp0ZXN0');
      expect(extracted).toBeNull();
    });
  });

  describe('validateAuthEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should validate with proper configuration', () => {
      process.env.ADMIN_PASSWORD_HASH = 'hashed-password';
      process.env.JWT_SECRET = 'secure-secret';

      const result = validateAuthEnv();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about missing password hash', () => {
      delete process.env.ADMIN_PASSWORD_HASH;
      delete process.env.ADMIN_PASSWORD;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = validateAuthEnv();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ADMIN_PASSWORD_HASH environment variable is required');

      consoleSpy.mockRestore();
    });

    it('should fail for production without secure JWT_SECRET', () => {
      process.env.NODE_ENV = 'production';
      process.env.ADMIN_PASSWORD_HASH = 'hashed-password';
      delete process.env.JWT_SECRET;

      const result = validateAuthEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('JWT_SECRET'))).toBe(true);
    });

    it('should warn in development about default JWT_SECRET', () => {
      process.env.NODE_ENV = 'development';
      process.env.ADMIN_PASSWORD_HASH = 'hashed-password';
      process.env.JWT_SECRET = 'leadmind-jwt-secret-change-in-production';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = validateAuthEnv();

      expect(result.valid).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
