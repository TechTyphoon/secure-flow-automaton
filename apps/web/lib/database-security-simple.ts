/**
 * Security Enhancement Layer for Database Operations
 * Provides input validation, sanitization, and security logging
 */

import { SecurityLogger, sanitizeSqlInput } from './security';

/**
 * Input validation and sanitization utilities
 */
export class SecurityValidator {
  /**
   * Validate and sanitize string input
   */
  static sanitizeString(input: string): string {
    return sanitizeSqlInput(input);
  }

  /**
   * Validate column name to prevent SQL injection
   */
  static validateColumnName(column: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
    return column;
  }

  /**
   * Validate and sanitize object data
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.validateColumnName(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate UUID format
   */
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

/**
 * Security logging for database operations
 */
export class DatabaseAuditor {
  /**
   * Log database operation for security audit
   */
  static logOperation(
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    data?: DatabaseOperationData,
    userId?: string
  ): void {
    SecurityLogger.logEvent('database_operation', {
      operation,
      table,
      userId,
      timestamp: new Date().toISOString(),
      dataFields: data ? Object.keys(data) : [],
    });
  }

  /**
   * Log security violation
   */
  static logSecurityViolation(
    violation: string,
    details: Record<string, any>
  ): void {
    SecurityLogger.logEvent('security_violation', {
      violation,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log permission check
   */
  static logPermissionCheck(
    operation: string,
    resource: string,
    userId?: string,
    granted: boolean = true
  ): void {
    SecurityLogger.logEvent('permission_check', {
      operation,
      resource,
      userId,
      granted,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Security metadata utilities
 */
export class SecurityMetadata {
  /**
   * Add security timestamps to data
   */
  static addTimestamps(data: Record<string, any>, isUpdate = false): Record<string, any> {
    const timestamp = new Date().toISOString();
    
    if (isUpdate) {
      return {
        ...data,
        updated_at: timestamp,
      };
    }
    
    return {
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    };
  }

  /**
   * Add user context to data
   */
  static addUserContext(data: Record<string, any>, userId: string): Record<string, any> {
    return {
      ...data,
      user_id: userId,
    };
  }

  /**
   * Add security classification
   */
  static addSecurityClassification(
    data: Record<string, any>,
    classification: 'public' | 'internal' | 'confidential' | 'restricted' = 'internal'
  ): Record<string, any> {
    return {
      ...data,
      security_classification: classification,
    };
  }
}

/**
 * Rate limiting for sensitive operations
 */
export class SecurityRateLimiter {
  private static attempts: Map<string, number[]> = new Map();

  /**
   * Check if operation is allowed based on rate limiting
   */
  static isAllowed(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing attempts for this key
    const keyAttempts = this.attempts.get(key) || [];
    
    // Filter out attempts outside the window
    const validAttempts = keyAttempts.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validAttempts.length >= maxAttempts) {
      DatabaseAuditor.logSecurityViolation('rate_limit_exceeded', {
        key,
        attempts: validAttempts.length,
        maxAttempts,
        windowMs,
      });
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  static getRemainingAttempts(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    const keyAttempts = this.attempts.get(key) || [];
    const validAttempts = keyAttempts.filter(time => time > windowStart);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  }
}

/**
 * Security checks for common operations
 */
export class SecurityChecks {
  /**
   * Check if user can access resource
   */
  static canAccessResource(
    userId: string,
    resourceOwnerId: string,
    userRole?: string
  ): boolean {
    // Users can access their own resources
    if (userId === resourceOwnerId) {
      return true;
    }
    
    // Admins can access all resources
    if (userRole === 'admin' || userRole === 'security_admin') {
      return true;
    }
    
    return false;
  }

  /**
   * Validate data before database operation
   */
  static validateForDatabase(
    data: Record<string, any>,
    requiredFields: string[] = []
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate string fields
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check for SQL injection patterns
        if (/['"\\;]|union|select|insert|update|delete|drop|exec|script/gi.test(value)) {
          errors.push(`Potentially malicious content in field: ${key}`);
        }
        
        // Check for XSS patterns
        if (/<script|javascript:|on\w+\s*=/gi.test(value)) {
          errors.push(`Potentially malicious script content in field: ${key}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if operation is safe to perform
   */
  static isSafeOperation(
    operation: string,
    table: string,
    filters: Record<string, any> = {}
  ): boolean {
    // Prevent mass deletion
    if (operation === 'DELETE' && Object.keys(filters).length === 0) {
      DatabaseAuditor.logSecurityViolation('mass_deletion_attempt', {
        operation,
        table,
      });
      return false;
    }
    
    // Prevent updating all records
    if (operation === 'UPDATE' && Object.keys(filters).length === 0) {
      DatabaseAuditor.logSecurityViolation('mass_update_attempt', {
        operation,
        table,
      });
      return false;
    }
    
    return true;
  }
}

/**
 * Main security wrapper for database operations
 */
export const DatabaseSecurity = {
  Validator: SecurityValidator,
  Auditor: DatabaseAuditor,
  Metadata: SecurityMetadata,
  RateLimiter: SecurityRateLimiter,
  Checks: SecurityChecks,
};

// Type definitions for database security
interface DatabaseOperationData {
  [key: string]: string | number | boolean | null | undefined;
}

export default DatabaseSecurity;
