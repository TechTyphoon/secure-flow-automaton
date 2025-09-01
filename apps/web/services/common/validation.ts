/**
 * Comprehensive Input Validation Utility
 *
 * Features:
 * - Type-safe validation with detailed error messages
 * - Sanitization and normalization of inputs
 * - Security-focused validation rules
 * - Integration with error handling system
 * - Configurable validation rules
 */

import {
  ValidationError,
  ErrorHandler,
  createErrorContext,
  ErrorContext
} from './errors';
import { getLogger } from './logger';

export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: any) => boolean;
  message: string;
  severity?: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sanitizedValue?: any;
}

export interface SanitizationRule<T = any> {
  name: string;
  sanitize: (value: T) => T;
}

// Email validation
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
export const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// Common validation rules
export class ValidationRules {
  static email(): ValidationRule<string> {
    return {
      name: 'email',
      validate: (value: string) => emailRegex.test(value),
      message: 'Invalid email format'
    };
  }

  static phone(): ValidationRule<string> {
    return {
      name: 'phone',
      validate: (value: string) => phoneRegex.test(value),
      message: 'Invalid phone number format'
    };
  }

  static url(): ValidationRule<string> {
    return {
      name: 'url',
      validate: (value: string) => urlRegex.test(value),
      message: 'Invalid URL format'
    };
  }

  static required(): ValidationRule<any> {
    return {
      name: 'required',
      validate: (value: any) => value !== null && value !== undefined && value !== '',
      message: 'This field is required'
    };
  }

  static minLength(min: number): ValidationRule<string> {
    return {
      name: 'minLength',
      validate: (value: string) => value.length >= min,
      message: `Minimum length is ${min} characters`
    };
  }

  static maxLength(max: number): ValidationRule<string> {
    return {
      name: 'maxLength',
      validate: (value: string) => value.length <= max,
      message: `Maximum length is ${max} characters`
    };
  }

  static pattern(regex: RegExp, message?: string): ValidationRule<string> {
    return {
      name: 'pattern',
      validate: (value: string) => regex.test(value),
      message: message || 'Value does not match required pattern'
    };
  }

  static range(min: number, max: number): ValidationRule<number> {
    return {
      name: 'range',
      validate: (value: number) => value >= min && value <= max,
      message: `Value must be between ${min} and ${max}`
    };
  }

  static oneOf(options: any[]): ValidationRule<any> {
    return {
      name: 'oneOf',
      validate: (value: any) => options.includes(value),
      message: `Value must be one of: ${options.join(', ')}`
    };
  }

  static custom<T>(validator: (value: T) => boolean, message: string): ValidationRule<T> {
    return {
      name: 'custom',
      validate: validator,
      message
    };
  }
}

// Sanitization rules
export class SanitizationRules {
  static trim(): SanitizationRule<string> {
    return {
      name: 'trim',
      sanitize: (value: string) => value.trim()
    };
  }

  static lowercase(): SanitizationRule<string> {
    return {
      name: 'lowercase',
      sanitize: (value: string) => value.toLowerCase()
    };
  }

  static uppercase(): SanitizationRule<string> {
    return {
      name: 'uppercase',
      sanitize: (value: string) => value.toUpperCase()
    };
  }

  static escapeHtml(): SanitizationRule<string> {
    return {
      name: 'escapeHtml',
      sanitize: (value: string) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    };
  }

  static removeSpecialChars(): SanitizationRule<string> {
    return {
      name: 'removeSpecialChars',
      sanitize: (value: string) => value.replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    };
  }

  static normalizeSpaces(): SanitizationRule<string> {
    return {
      name: 'normalizeSpaces',
      sanitize: (value: string) => value.replace(/\s+/g, ' ')
    };
  }
}

export class Validator {
  private logger = getLogger();

  /**
   * Validate a single value against rules
   */
  validate<T>(
    value: T,
    rules: ValidationRule<T>[],
    context?: ErrorContext,
    fieldName?: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let sanitizedValue = value; // eslint-disable-line prefer-const

    for (const rule of rules) {
      try {
        if (!rule.validate(sanitizedValue, context?.metadata)) {
          const validationError = new ValidationError(
            rule.message,
            context || createErrorContext('Validator', 'validate'),
            fieldName || 'unknown',
            sanitizedValue
          );

          if (rule.severity === 'warning') {
            warnings.push(validationError);
          } else {
            errors.push(validationError);
          }
        }
      } catch (error) {
        const baseError = ErrorHandler.handle(error, context);
        this.logger.error(`Validation rule '${rule.name}' failed`, context, baseError);
        errors.push(new ValidationError(
          `Validation error: ${baseError.message}`,
          context || createErrorContext('Validator', 'validate'),
          fieldName || 'unknown'
        ));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue
    };
  }

  /**
   * Validate an object against a schema
   */
  validateObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, ValidationRule[]>,
    context?: ErrorContext
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    const sanitizedObj = { ...obj };

    for (const [field, rules] of Object.entries(schema)) {
      const result = this.validate(obj[field], rules, context, field);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
      allWarnings.push(...result.warnings);
      if (result.sanitizedValue !== undefined) {
        sanitizedObj[field] = result.sanitizedValue;
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      sanitizedValue: sanitizedObj
    };
  }

  /**
   * Sanitize a value using sanitization rules
   */
  sanitize<T>(value: T, rules: SanitizationRule<T>[]): T {
    let sanitized = value;

    for (const rule of rules) {
      try {
        sanitized = rule.sanitize(sanitized);
      } catch (error) {
        this.logger.warn(`Sanitization rule '${rule.name}' failed`, {
          service: 'Validator',
          operation: 'sanitize',
          metadata: { ruleName: rule.name, error: error.message }
        });
      }
    }

    return sanitized;
  }

  /**
   * Validate and sanitize input in one operation
   */
  validateAndSanitize<T>(
    value: T,
    validationRules: ValidationRule<T>[],
    sanitizationRules: SanitizationRule<T>[] = [],
    context?: ErrorContext,
    fieldName?: string
  ): ValidationResult {
    // First sanitize
    const sanitizedValue = this.sanitize(value, sanitizationRules);

    // Then validate
    return this.validate(sanitizedValue, validationRules, context, fieldName);
  }
}

// Pre-configured validators for common use cases
export class CommonValidators {
  static email(fieldName: string = 'email'): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.email(),
      ValidationRules.minLength(5),
      ValidationRules.maxLength(254)
    ];
  }

  static password(fieldName: string = 'password'): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.minLength(8),
      ValidationRules.maxLength(128),
      ValidationRules.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
    ];
  }

  static username(fieldName: string = 'username'): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(50),
      ValidationRules.pattern(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
    ];
  }

  static url(fieldName: string = 'url'): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.url(),
      ValidationRules.maxLength(2048)
    ];
  }

  static phone(fieldName: string = 'phone'): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.phone(),
      ValidationRules.maxLength(20)
    ];
  }

  static securityQuery(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(1000),
      ValidationRules.pattern(
        /^[a-zA-Z0-9\s.,!?(){}:;"'-]+$/,
      'Query contains invalid characters'
      )
    ];
  }

  static sessionId(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
        'Invalid session ID format'
      )
    ];
  }
}

// Security-focused validation
export class SecurityValidators {
  static noSqlInjection(): ValidationRule<string> {
    return {
      name: 'noSqlInjection',
      validate: (value: string) => !detectSqlInjection(value),
      message: 'Input contains potentially dangerous SQL keywords or patterns'
    };
  }

  static noXss(): ValidationRule<string> {
    return {
      name: 'noXss',
      validate: (value: string) => !/<script|javascript:|on\w+=/i.test(value),
      message: 'Input contains potentially dangerous script content'
    };
  }

  static safePath(): ValidationRule<string> {
    return {
      name: 'safePath',
      validate: (value: string) => !(value.includes('..' + '/') || value.includes('..' + '\\')) && !(value.includes('/..') || value.includes('\\..')),
      message: 'Path contains directory traversal attempts'
    };
  }

  static noCommandInjection(): ValidationRule<string> {
    return {
      name: 'noCommandInjection',
      validate: (value: string) => !/[;&|`$()<>]/.test(value),
      message: 'Input contains potentially dangerous command characters'
    };
  }
}

// Global validator instance
let globalValidator: Validator | null = null;

export function getValidator(): Validator {
  if (!globalValidator) {
    globalValidator = new Validator();
  }
  return globalValidator;
}

// Convenience validation functions
export function validateEmail(email: string, context?: ErrorContext): ValidationResult {
  return getValidator().validate(email, CommonValidators.email(), context, 'email');
}

export function validatePassword(password: string, context?: ErrorContext): ValidationResult {
  return getValidator().validate(password, CommonValidators.password(), context, 'password');
}

export function validateSecurityQuery(query: string, context?: ErrorContext): ValidationResult {
  return getValidator().validate(
    query,
    [...CommonValidators.securityQuery(), SecurityValidators.noSqlInjection(), SecurityValidators.noXss()],
    context,
    'query'
  );
}

export function validateSessionId(sessionId: string, context?: ErrorContext): ValidationResult {
  return getValidator().validate(sessionId, CommonValidators.sessionId(), context, 'sessionId');
}

// Security-aware sanitization
export function sanitizeUserInput(input: string): string {
  const validator = getValidator();
  return validator.sanitize(input, [
    SanitizationRules.trim(),
    SanitizationRules.escapeHtml(),
    SanitizationRules.removeSpecialChars(),
    SanitizationRules.normalizeSpaces()
  ]);
}

export function sanitizeQuery(query: string): string {
  const validator = getValidator();
  return validator.sanitize(query, [
    SanitizationRules.trim(),
    SanitizationRules.normalizeSpaces(),
    SanitizationRules.escapeHtml()
  ]);
}

// Additional sanitization helpers
export function sanitizeAndTrim(input: string): string {
  const validator = getValidator();
  return validator.sanitize(input, [SanitizationRules.trim()]);
}

export function sanitizeAndLowercase(input: string): string {
  const validator = getValidator();
  return validator.sanitize(input, [SanitizationRules.lowercase()]);
}

// Enhanced SQL injection detection
export function detectSqlInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(%27)|(%23)|(%2D%2D))/i,
    /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER))/i,
    /(\bOR\b|\bAND\b).*(=|<|>)/i,
    /(\bUNION\b).*(\bSELECT\b)/i
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}

// Update SecurityValidators to use enhanced detection
// Note: SecurityValidators class is defined earlier in the file

// API-specific validation
export class ApiValidators {
  static apiEndpoint(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^https?:\/\/(localhost|[\w.-]+)(:\d{1,5})?(\/[\w.-]*)*\/?(\?[\w&=.-]*)?$/,
        'Invalid API endpoint format'
      ),
      ValidationRules.maxLength(2048)
    ];
  }

  static httpMethod(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.oneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
    ];
  }

  static httpHeaders(): ValidationRule<Record<string, string>>[] {
    return [
      {
        name: 'headers',
        validate: (headers: Record<string, string>) => {
          // Check for dangerous headers
          const dangerousHeaders = ['host', 'authorization', 'cookie', 'set-cookie'];
          return !Object.keys(headers).some(key =>
            dangerousHeaders.includes(key.toLowerCase())
          );
        },
        message: 'Headers contain potentially dangerous header names'
      }
    ];
  }

  static requestBody(): ValidationRule<any>[] {
    return [
      ValidationRules.custom(
        (body: any) => {
          if (typeof body === 'string') {
            return body.length <= 1024 * 1024; // 1MB limit
          }
          if (typeof body === 'object') {
            const jsonString = JSON.stringify(body);
            return jsonString.length <= 1024 * 1024; // 1MB limit
          }
          return true;
        },
        'Request body exceeds size limit (1MB)'
      )
    ];
  }
}

// Data processing validation
export class DataValidators {
  static filePath(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[^\0\n\r\t\f]+$/,
        'File path contains invalid characters'
      ),
      ValidationRules.maxLength(4096),
      SecurityValidators.safePath()
    ];
  }

  static fileName(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[^/\\:*?"<>|\0\n\r\t\f]+$/,
        'Filename contains invalid characters'
      ),
      ValidationRules.maxLength(255)
    ];
  }

  static mimeType(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[a-z]+\/[a-z0-9.+-]+$/,
        'Invalid MIME type format'
      ),
      ValidationRules.oneOf([
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml', 'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm',
        'application/octet-stream'
      ])
    ];
  }

  static fileSize(): ValidationRule<number>[] {
    return [
      ValidationRules.range(1, 100 * 1024 * 1024), // 1 byte to 100MB
      ValidationRules.custom(
        (size: number) => size <= 10 * 1024 * 1024 || confirm('Large file detected. Continue?'),
        'File size exceeds recommended limit'
      )
    ];
  }

  static dataClassification(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.oneOf([
        'public', 'internal', 'confidential', 'restricted',
        'public_unclassified', 'sensitive', 'secret', 'top_secret'
      ])
    ];
  }
}

// Network validation
export class NetworkValidators {
  static ipAddress(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?\d\d?)$/,
        'Invalid IPv4 address format'
      )
    ];
  }

  static ipv6Address(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
        'Invalid IPv6 address format'
      )
    ];
  }

  static macAddress(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/,
        'Invalid MAC address format'
      )
    ];
  }

  static portNumber(): ValidationRule<number>[] {
    return [
      ValidationRules.range(1, 65535)
    ];
  }

  static domainName(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        'Invalid domain name format'
      ),
      ValidationRules.maxLength(253)
    ];
  }

  static url(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
        'Invalid URL format'
      ),
      ValidationRules.maxLength(2048)
    ];
  }
}

// Notification validation
export class NotificationValidators {
  static emailRecipient(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.email(),
      ValidationRules.maxLength(254)
    ];
  }

  static phoneNumber(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.phone(),
      ValidationRules.maxLength(20)
    ];
  }

  static messageContent(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.maxLength(10000), // 10KB limit
      SecurityValidators.noXss()
    ];
  }

  static notificationType(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.oneOf([
        'email', 'sms', 'push', 'slack', 'webhook',
        'alert', 'warning', 'info', 'critical'
      ])
    ];
  }
}

// Configuration validation
export class ConfigValidators {
  static configKey(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[A-Z][A-Z0-9_]*$/,
        'Configuration key must be uppercase with underscores'
      ),
      ValidationRules.maxLength(100)
    ];
  }

  static configValue(): ValidationRule<any>[] {
    return [
      ValidationRules.custom(
        (value: any) => {
          if (typeof value === 'string') {
            return value.length <= 10000; // 10KB limit for string values
          }
          return true;
        },
        'Configuration value exceeds size limit'
      )
    ];
  }

  static jsonConfig(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.custom(
        (value: string) => {
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        },
        'Invalid JSON format'
      ),
      ValidationRules.maxLength(100000) // 100KB limit
    ];
  }
}

// Business logic validation
export class BusinessValidators {
  static userRole(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.oneOf([
        'admin', 'manager', 'analyst', 'operator', 'viewer',
        'security_admin', 'compliance_officer', 'auditor'
      ])
    ];
  }

  static permission(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/,
        'Permission must be in format "resource:action"'
      )
    ];
  }

  static policyName(): ValidationRule<string>[] {
    return [
      ValidationRules.required(),
      ValidationRules.pattern(
        /^[a-zA-Z][a-zA-Z0-9_-]*$/,
        'Policy name must start with letter and contain only alphanumeric characters, hyphens, and underscores'
      ),
      ValidationRules.maxLength(100)
    ];
  }

  static threshold(): ValidationRule<number>[] {
    return [
      ValidationRules.range(0, 100),
      ValidationRules.custom(
        (value: number) => Number.isFinite(value),
        'Threshold must be a finite number'
      )
    ];
  }
}

// Specialized sanitizers
export function sanitizeFilePath(path: string): string {
  const validator = getValidator();
  return validator.sanitize(path, [
    SanitizationRules.trim(),
    SanitizationRules.normalizeSpaces()
  ]);
}

export function sanitizeEmail(email: string): string {
  const validator = getValidator();
  return validator.sanitize(email, [
    SanitizationRules.trim(),
    SanitizationRules.lowercase()
  ]);
}

export function sanitizePhoneNumber(phone: string): string {
  const validator = getValidator();
  return validator.sanitize(phone, [
    SanitizationRules.trim(),
    SanitizationRules.normalizeSpaces()
  ]);
}

export function sanitizeDomain(domain: string): string {
  const validator = getValidator();
  return validator.sanitize(domain, [
    SanitizationRules.trim(),
    SanitizationRules.lowercase()
  ]);
}
