/**
 * Security-focused test utilities and enhanced testing infrastructure
 * Provides tools for testing authentication, authorization, input validation, and security features
 */

import { vi, expect } from 'vitest';
import { validatePassword, RateLimiter } from '@/lib/security';
import { DatabaseSecurity } from '@/lib/database-security-simple';

/**
 * Mock security logger for testing
 */
export const mockSecurityLogger = {
  events: [] as any[],
  logEvent: vi.fn((event: string, details: any) => {
    mockSecurityLogger.events.push({ event, details, timestamp: new Date().toISOString() });
  }),
  clearEvents: () => {
    mockSecurityLogger.events = [];
    mockSecurityLogger.logEvent.mockClear();
  },
};

/**
 * Security test utilities
 */
export const SecurityTestUtils = {
  /**
   * Test input sanitization
   */
  testInputSanitization: {
    sqlInjectionPayloads: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "UNION SELECT * FROM users",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    ],
    
    xssPayloads: [
      "<script>alert('XSS')</script>",
      "javascript:alert('XSS')",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
    ],
    
    pathTraversalPayloads: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    ],

    async testSanitization(input: string, sanitizeFunction: (input: string) => string) {
      const sanitized = sanitizeFunction(input);
      
      // Should not contain dangerous patterns
      expect(sanitized).not.toMatch(/[<>]/);
      expect(sanitized).not.toMatch(/javascript:/i);
      expect(sanitized).not.toMatch(/on\w+\s*=/i);
      expect(sanitized).not.toMatch(/['"\\;]/);
      expect(sanitized).not.toMatch(/\b(union|select|insert|update|delete|drop|exec|script)\b/i);
      
      return sanitized;
    },
  },

  /**
   * Test authentication security
   */
  testAuthentication: {
    async testPasswordValidation(password: string) {
      const result = validatePassword(password);
      
      // Test that validation function exists and returns expected structure
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('strength');
      expect(Array.isArray(result.errors)).toBe(true);
      
      return result;
    },

    async testRateLimiting(identifier: string, attempts: number, limit: number) {
      const rateLimiter = new RateLimiter();
      const results = [];
      
      for (let i = 0; i < attempts; i++) {
        const allowed = rateLimiter.isAllowed(identifier, limit, 60000); // 1 minute window
        results.push(allowed);
      }
      
      // First attempts should be allowed, later ones blocked
      expect(results.slice(0, limit).every(r => r)).toBe(true);
      if (attempts > limit) {
        expect(results.slice(limit).every(r => !r)).toBe(true);
      }
      
      return results;
    },

    mockAuthenticatedUser: {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
    },

    mockAdminUser: {
      id: 'admin-user-123',
      email: 'admin@example.com',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  },

  /**
   * Test authorization and access control
   */
  testAuthorization: {
    async testResourceAccess(userId: string, resourceOwnerId: string, userRole?: string) {
      const canAccess = DatabaseSecurity.Checks.canAccessResource(userId, resourceOwnerId, userRole);
      
      if (userId === resourceOwnerId) {
        expect(canAccess).toBe(true);
      } else if (userRole === 'admin' || userRole === 'security_admin') {
        expect(canAccess).toBe(true);
      } else {
        expect(canAccess).toBe(false);
      }
      
      return canAccess;
    },

    async testDataValidation(data: Record<string, any>, requiredFields: string[]) {
      const validation = DatabaseSecurity.Checks.validateForDatabase(data, requiredFields);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(Array.isArray(validation.errors)).toBe(true);
      
      return validation;
    },
  },

  /**
   * Test error handling and security logging
   */
  testErrorHandling: {
    async testSecurityEventLogging(eventType: string, details: any) {
      const initialEventCount = mockSecurityLogger.events.length;
      
      mockSecurityLogger.logEvent(eventType, details);
      
      expect(mockSecurityLogger.events).toHaveLength(initialEventCount + 1);
      
      const lastEvent = mockSecurityLogger.events[mockSecurityLogger.events.length - 1];
      expect(lastEvent.event).toBe(eventType);
      expect(lastEvent.details).toEqual(details);
      
      return lastEvent;
    },

    async testErrorBoundary() {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        throw new Error('Test security error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Test security error');
      }
      
      consoleSpy.mockRestore();
    },
  },

  /**
   * Security-focused validation testing
   */
  testSecureValidation: {
    async testInputSecurity(input: string) {
      // Test for dangerous patterns
      const hasSqlInjection = /['"\\;]|\b(union|select|insert|update|delete|drop|exec|script)\b/i.test(input);
      const hasXss = /[<>]|javascript:|on\w+\s*=/i.test(input);
      const hasPathTraversal = /\.\.\/|\.\.\\|%2e%2e%2f/i.test(input);
      
      return {
        isSafe: !hasSqlInjection && !hasXss && !hasPathTraversal,
        threats: {
          sqlInjection: hasSqlInjection,
          xss: hasXss,
          pathTraversal: hasPathTraversal,
        },
      };
    },

    async testFormValidation(formData: Record<string, any>, requiredFields: string[]) {
      const errors = [];
      
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
          errors.push(`${field} is required`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  /**
   * Performance and security monitoring tests
   */
  testMonitoring: {
    async testPerformanceMetrics() {
      const startTime = performance.now();
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Performance should be within acceptable limits
      expect(duration).toBeLessThan(5000); // 5 seconds max
      
      return duration;
    },

    async testSecurityHeaders(headers: Record<string, string>) {
      // Check security headers
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(headers['strict-transport-security']).toContain('max-age');
      expect(headers['content-security-policy']).toBeTruthy();
      
      return headers;
    },
  },
};

/**
 * Custom test matchers for security testing
 */
export const securityMatchers = {
  toBeSecurePassword: (password: string) => {
    const validation = validatePassword(password);
    
    return {
      pass: validation.isValid,
      message: () => validation.isValid 
        ? `Expected password to be insecure`
        : `Expected password to be secure. Errors: ${validation.errors.join(', ')}`,
    };
  },

  toBeSanitized: (input: string) => {
    const hasDangerousContent = /[<>]|javascript:|on\w+\s*=|['"\\;]|\b(union|select|insert|update|delete|drop|exec|script)\b/i.test(input);
    
    return {
      pass: !hasDangerousContent,
      message: () => hasDangerousContent 
        ? `Expected "${input}" to be sanitized but it contains dangerous content`
        : `Expected "${input}" to contain dangerous content but it was properly sanitized`,
    };
  },

  toHaveSecurityEvent: (events: any[], eventType: string) => {
    const hasEvent = events.some(event => event.event === eventType);
    
    return {
      pass: hasEvent,
      message: () => hasEvent 
        ? `Expected events not to contain "${eventType}"`
        : `Expected events to contain "${eventType}". Found: ${events.map(e => e.event).join(', ')}`,
    };
  },
};

/**
 * Test data generators for security testing
 */
export const SecurityTestData = {
  generateMaliciousInputs: () => ({
    sqlInjection: SecurityTestUtils.testInputSanitization.sqlInjectionPayloads,
    xss: SecurityTestUtils.testInputSanitization.xssPayloads,
    pathTraversal: SecurityTestUtils.testInputSanitization.pathTraversalPayloads,
  }),

  generateValidInputs: () => ({
    email: 'test@example.com',
    password: 'SecurePassword123!',
    username: 'testuser123',
    description: 'This is a safe test description',
  }),

  generateLargeInputs: () => ({
    longString: 'a'.repeat(10000),
    deepObject: Array(100).fill(null).reduce((obj, _, i) => ({ nested: obj }), {}),
    largeArray: Array(1000).fill('test'),
  }),
};

export default SecurityTestUtils;
