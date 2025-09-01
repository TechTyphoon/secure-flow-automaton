/**
 * Unit tests for the enhanced validation system
 * Demonstrates comprehensive input validation and sanitization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ValidationRules,
  CommonValidators,
  SecurityValidators,
  ApiValidators,
  DataValidators,
  NetworkValidators,
  NotificationValidators,
  ConfigValidators,
  BusinessValidators,
  Validator,
  sanitizeUserInput,
  sanitizeQuery,
  sanitizeEmail,
  sanitizeAndTrim,
  sanitizeAndLowercase,
  validateEmail,
  validateSecurityQuery,
  getValidator
} from '../../../apps/web/services/common/validation';
import {
  ValidationError,
  createErrorContext
} from '../../../apps/web/services/common/errors';

describe('Enhanced Validation System', () => {
  let validator: Validator;
  const context = createErrorContext('ValidationTest', 'test');

  beforeEach(() => {
    validator = getValidator();
  });

  describe('Common Validators', () => {
    describe('Email Validation', () => {
      it('should validate valid email addresses', () => {
        const result = validator.validate('user@example.com', CommonValidators.email(), context, 'email');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        const result = validator.validate('invalid-email', CommonValidators.email(), context, 'email');
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toBeInstanceOf(ValidationError);
      });
    });

    describe('Password Validation', () => {
      it('should validate strong passwords', () => {
        const result = validator.validate('StrongPass123!', CommonValidators.password(), context, 'password');
        expect(result.isValid).toBe(true);
      });

      it('should reject weak passwords', () => {
        const result = validator.validate('weak', CommonValidators.password(), context, 'password');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Security Query Validation', () => {
      it('should validate safe security queries', () => {
        const result = validator.validate(
          'Show me security alerts for today',
          CommonValidators.securityQuery(),
          context,
          'query'
        );
        expect(result.isValid).toBe(true);
      });

      it('should reject queries with SQL injection attempts', () => {
        const result = validator.validate(
          'Show me alerts; DROP TABLE users;',
          [...CommonValidators.securityQuery(), SecurityValidators.noSqlInjection()],
          context,
          'query'
        );
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Security Validators', () => {
    describe('SQL Injection Prevention', () => {
      it('should detect SQL injection patterns', () => {
        const result = validator.validate(
          'SELECT * FROM users WHERE id = 1 UNION SELECT password FROM admin',
          [SecurityValidators.noSqlInjection()],
          context,
          'input'
        );
        expect(result.isValid).toBe(false);
      });

      it('should allow safe SQL-like queries', () => {
        const result = validator.validate(
          'Show me the security dashboard',
          [SecurityValidators.noSqlInjection()],
          context,
          'input'
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe('XSS Prevention', () => {
      it('should detect XSS attempts', () => {
        const result = validator.validate(
          '<script>alert("XSS")</script>',
          [SecurityValidators.noXss()],
          context,
          'input'
        );
        expect(result.isValid).toBe(false);
      });

      it('should detect JavaScript injection', () => {
        const result = validator.validate(
          'javascript:alert("XSS")',
          [SecurityValidators.noXss()],
          context,
          'input'
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe('Path Traversal Prevention', () => {
      it('should detect path traversal attempts', () => {
        const result = validator.validate(
          '../../../etc/passwd',
          [SecurityValidators.safePath()],
          context,
          'path'
        );
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('API Validators', () => {
    describe('HTTP Method Validation', () => {
      it('should validate standard HTTP methods', () => {
        const result = validator.validate('POST', ApiValidators.httpMethod(), context, 'method');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid HTTP methods', () => {
        const result = validator.validate('INVALID', ApiValidators.httpMethod(), context, 'method');
        expect(result.isValid).toBe(false);
      });
    });

    describe('API Endpoint Validation', () => {
      it('should validate valid API endpoints', () => {
        const result = validator.validate(
          'https://api.example.com/v1/users',
          ApiValidators.apiEndpoint(),
          context,
          'endpoint'
        );
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid endpoints', () => {
        const result = validator.validate(
          'not-a-valid-url',
          ApiValidators.apiEndpoint(),
          context,
          'endpoint'
        );
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Data Validators', () => {
    describe('File Path Validation', () => {
      it('should validate safe file paths', () => {
        const result = validator.validate(
          '/uploads/documents/report.pdf',
          DataValidators.filePath(),
          context,
          'path'
        );
        expect(result.isValid).toBe(true);
      });

      it('should reject path traversal attempts', () => {
        const result = validator.validate(
          '../../../etc/passwd',
          DataValidators.filePath(),
          context,
          'path'
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe('MIME Type Validation', () => {
      it('should validate common MIME types', () => {
        const result = validator.validate('application/json', DataValidators.mimeType(), context, 'mimeType');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid MIME types', () => {
        const result = validator.validate('invalid/type', DataValidators.mimeType(), context, 'mimeType');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Data Classification Validation', () => {
      it('should validate security classifications', () => {
        const result = validator.validate('confidential', DataValidators.dataClassification(), context, 'classification');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid classifications', () => {
        const result = validator.validate('invalid_level', DataValidators.dataClassification(), context, 'classification');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Network Validators', () => {
    describe('IPv4 Address Validation', () => {
      it('should validate valid IPv4 addresses', () => {
        const result = validator.validate('192.168.1.1', NetworkValidators.ipAddress(), context, 'ip');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid IPv4 addresses', () => {
        const result = validator.validate('999.999.999.999', NetworkValidators.ipAddress(), context, 'ip');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Domain Name Validation', () => {
      it('should validate valid domain names', () => {
        const result = validator.validate('example.com', NetworkValidators.domainName(), context, 'domain');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid domain names', () => {
        const result = validator.validate('invalid..domain', NetworkValidators.domainName(), context, 'domain');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Port Number Validation', () => {
      it('should validate valid port numbers', () => {
        const result = validator.validate(8080, NetworkValidators.portNumber(), context, 'port');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid port numbers', () => {
        const result = validator.validate(99999, NetworkValidators.portNumber(), context, 'port');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Notification Validators', () => {
    describe('Email Recipient Validation', () => {
      it('should validate valid email recipients', () => {
        const result = validator.validate(
          'user@example.com',
          NotificationValidators.emailRecipient(),
          context,
          'recipient'
        );
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid email recipients', () => {
        const result = validator.validate(
          'invalid-email',
          NotificationValidators.emailRecipient(),
          context,
          'recipient'
        );
        expect(result.isValid).toBe(false);
      });
    });

    describe('Message Content Validation', () => {
      it('should validate safe message content', () => {
        const result = validator.validate(
          'This is a security alert message',
          NotificationValidators.messageContent(),
          context,
          'message'
        );
        expect(result.isValid).toBe(true);
      });

      it('should reject messages with XSS attempts', () => {
        const result = validator.validate(
          'Alert: <script>alert("XSS")</script>',
          NotificationValidators.messageContent(),
          context,
          'message'
        );
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Business Logic Validators', () => {
    describe('User Role Validation', () => {
      it('should validate valid user roles', () => {
        const result = validator.validate('security_admin', BusinessValidators.userRole(), context, 'role');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid user roles', () => {
        const result = validator.validate('super_admin', BusinessValidators.userRole(), context, 'role');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Permission Validation', () => {
      it('should validate valid permissions', () => {
        const result = validator.validate('security:read', BusinessValidators.permission(), context, 'permission');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid permission formats', () => {
        const result = validator.validate('invalid-permission', BusinessValidators.permission(), context, 'permission');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Sanitization Functions', () => {
    describe('User Input Sanitization', () => {
      it('should sanitize HTML content', () => {
        const input = '<script>alert("XSS")</script>Hello World';
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<');
      });

      it('should preserve safe content', () => {
        const input = 'Hello World 123';
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).toBe(input);
      });
    });

    describe('Email Sanitization', () => {
      it('should normalize email case', () => {
        const email = 'User@Example.COM';
        const sanitized = sanitizeEmail(email);
        expect(sanitized).toBe('user@example.com');
      });
    });

    describe('Query Sanitization', () => {
      it('should clean query input', () => {
        const query = '  Show  me  alerts  ';
        const sanitized = sanitizeQuery(query);
        expect(sanitized).toBe('Show me alerts');
      });
    });
  });

  describe('Object Validation', () => {
    it('should validate complex objects', () => {
      const userSchema = {
        email: CommonValidators.email(),
        password: CommonValidators.password(),
        role: BusinessValidators.userRole()
      };

      const validUser = {
        email: 'user@example.com',
        password: 'StrongPass123!',
        role: 'analyst'
      };

      const result = validator.validateObject(validUser, userSchema, context);
      expect(result.isValid).toBe(true);
    });

    it('should collect multiple validation errors', () => {
      const userSchema = {
        email: CommonValidators.email(),
        password: CommonValidators.password(),
        role: BusinessValidators.userRole()
      };

      const invalidUser = {
        email: 'invalid-email',
        password: 'weak',
        role: 'invalid_role'
      };

      const result = validator.validateObject(invalidUser, userSchema, context);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Validation with Sanitization', () => {
    it('should sanitize and then validate input', () => {
      const input = '  user@example.com  ';
      const result = validator.validateAndSanitize(
        input,
        CommonValidators.email(),
        [sanitizeAndTrim, sanitizeAndLowercase].map(fn => ({
          name: fn.name,
          sanitize: fn
        })),
        context,
        'email'
      );

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('user@example.com');
    });
  });
});
