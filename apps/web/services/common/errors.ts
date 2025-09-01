/**
 * Comprehensive Error Handling System for Secure Flow Automaton
 *
 * This module provides a centralized error handling framework with:
 * - Custom error classes for different types of failures
 * - Error severity levels and categorization
 * - Structured error context and metadata
 * - Recovery strategies and fallback mechanisms
 * - Logging integration and monitoring capabilities
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  DATABASE = 'database',
  SECURITY = 'security',
  VALIDATION = 'validation',
  CONFIGURATION = 'configuration',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL_ERROR = 'internal_error',
  RATE_LIMIT = 'rate_limit',
  PERFORMANCE = 'performance',
  OPTIMIZATION = 'optimization'
}

export interface ErrorContext {
  service: string;
  operation: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'degrade' | 'notify' | 'escalate';
  maxRetries?: number;
  delay?: number;
  fallbackValue?: any;
  escalationContact?: string;
}

export abstract class BaseError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoveryStrategy?: RecoveryStrategy;
  public readonly code: string;
  public readonly isRecoverable: boolean;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: ErrorContext,
    recoveryStrategy?: RecoveryStrategy,
    isRecoverable: boolean = false
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = context;
    this.recoveryStrategy = recoveryStrategy;
    this.isRecoverable = isRecoverable;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      recoveryStrategy: this.recoveryStrategy,
      isRecoverable: this.isRecoverable,
      stack: this.stack
    };
  }
}

// Authentication Errors
export class AuthenticationError extends BaseError {
  constructor(message: string, context: ErrorContext, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'AUTH_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      recoveryStrategy,
      true // Usually recoverable with correct credentials
    );
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, context: ErrorContext, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'AUTHZ_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHORIZATION,
      context,
      recoveryStrategy,
      false // Usually not recoverable without policy changes
    );
  }
}

// Network and External Service Errors
export class NetworkError extends BaseError {
  constructor(message: string, context: ErrorContext, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      context,
      recoveryStrategy || {
        type: 'retry',
        maxRetries: 3,
        delay: 1000
      },
      true
    );
  }
}

export class ExternalServiceError extends BaseError {
  constructor(
    message: string,
    context: ErrorContext,
    serviceName: string,
    recoveryStrategy?: RecoveryStrategy
  ) {
    super(
      `${serviceName}: ${message}`,
      'EXT_SERVICE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.EXTERNAL_SERVICE,
      { ...context, metadata: { ...context.metadata, serviceName } },
      recoveryStrategy || {
        type: 'fallback',
        fallbackValue: null
      },
      true
    );
  }
}

// Database Errors
export class DatabaseError extends BaseError {
  constructor(message: string, context: ErrorContext, operation?: string, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'DB_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.DATABASE,
      { ...context, metadata: { ...context.metadata, operation } },
      recoveryStrategy || {
        type: 'retry',
        maxRetries: 2,
        delay: 500
      },
      true
    );
  }
}

// Security Errors
export class SecurityError extends BaseError {
  constructor(message: string, context: ErrorContext, threatLevel?: string, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'SECURITY_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.SECURITY,
      { ...context, metadata: { ...context.metadata, threatLevel } },
      recoveryStrategy || {
        type: 'escalate',
        escalationContact: 'security@company.com'
      },
      false
    );
  }
}

// Validation Errors
export class ValidationError extends BaseError {
  constructor(
    message: string,
    context: ErrorContext,
    field?: string,
    value?: any,
    recoveryStrategy?: RecoveryStrategy
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      {
        ...context,
        metadata: { ...context.metadata, field, value: value ? String(value) : undefined }
      },
      recoveryStrategy || {
        type: 'notify',
        fallbackValue: null
      },
      true
    );
  }
}

// Configuration Errors
export class ConfigurationError extends BaseError {
  constructor(message: string, context: ErrorContext, configKey?: string, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'CONFIG_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.CONFIGURATION,
      { ...context, metadata: { ...context.metadata, configKey } },
      recoveryStrategy || {
        type: 'notify',
        escalationContact: 'devops@company.com'
      },
      false
    );
  }
}

// Rate Limiting Errors
export class RateLimitError extends BaseError {
  constructor(message: string, context: ErrorContext, resetTime?: Date, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.RATE_LIMIT,
      { ...context, metadata: { ...context.metadata, resetTime: resetTime?.toISOString() } },
      recoveryStrategy || {
        type: 'retry',
        delay: 60000 // 1 minute
      },
      true
    );
  }
}

// Internal Errors
export class InternalError extends BaseError {
  constructor(message: string, context: ErrorContext, cause?: Error, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'INTERNAL_ERROR',
      ErrorSeverity.CRITICAL,
      ErrorCategory.INTERNAL_ERROR,
      { ...context, metadata: { ...context.metadata, cause: cause?.message } },
      recoveryStrategy || {
        type: 'escalate',
        escalationContact: 'engineering@company.com'
      },
      false
    );

    if (cause) {
      this.cause = cause;
    }
  }
}

// Performance Errors
export class PerformanceError extends BaseError {
  constructor(message: string, context: ErrorContext, cause?: Error, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'PERFORMANCE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.PERFORMANCE,
      { ...context, metadata: { ...context.metadata, cause: cause?.message } },
      recoveryStrategy || {
        type: 'notify',
        notificationChannel: 'performance-monitoring'
      },
      true
    );

    if (cause) {
      this.cause = cause;
    }
  }
}

export class OptimizationError extends BaseError {
  constructor(message: string, context: ErrorContext, cause?: Error, recoveryStrategy?: RecoveryStrategy) {
    super(
      message,
      'OPTIMIZATION_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.OPTIMIZATION,
      { ...context, metadata: { ...context.metadata, cause: cause?.message } },
      recoveryStrategy || {
        type: 'notify',
        notificationChannel: 'optimization-monitoring'
      },
      true
    );

    if (cause) {
      this.cause = cause;
    }
  }
}

// Error Handler Utility
export class ErrorHandler {
  private static logger: any = console; // Will be replaced with proper logger

  static setLogger(logger: any) {
    this.logger = logger;
  }

  static initializeWithLogger() {
    // Import logger dynamically to avoid circular dependencies
    import('./logger').then(({ getLogger }) => {
      this.logger = getLogger();
    }).catch(() => {
      // Fallback to console if logger import fails
      this.logger = console;
    });
  }

  static handle(error: Error | BaseError, context?: ErrorContext): BaseError {
    // If it's already a BaseError, just log and return
    if (error instanceof BaseError) {
      this.logError(error);
      return error;
    }

    // Convert generic errors to appropriate BaseError types
    const baseError = this.classifyError(error, context);
    this.logError(baseError);
    return baseError;
  }

  static classifyError(error: Error, context?: ErrorContext): BaseError {
    const defaultContext: ErrorContext = {
      service: 'unknown',
      operation: 'unknown',
      timestamp: new Date(),
      ...context
    };

    // Network-related errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message, defaultContext);
    }

    // Database-related errors
    if (error.message.includes('database') || error.message.includes('connection')) {
      return new DatabaseError(error.message, defaultContext);
    }

    // Authentication-related errors
    if (error.message.includes('auth') || error.message.includes('credential')) {
      return new AuthenticationError(error.message, defaultContext);
    }

    // Default to internal error
    return new InternalError(error.message, defaultContext, error);
  }

  static logError(error: BaseError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.severity.toUpperCase()}] ${error.category}: ${error.message}`;

    const logData = {
      code: error.code,
      context: error.context,
      recoveryStrategy: error.recoveryStrategy,
      stack: error.stack
    };

    switch (logLevel) {
      case 'error':
        this.logger.error(logMessage, logData);
        break;
      case 'warn':
        this.logger.warn(logMessage, logData);
        break;
      case 'info':
        this.logger.info(logMessage, logData);
        break;
      default:
        this.logger.debug(logMessage, logData);
    }
  }

  private static getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'error';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'debug';
    }
  }

  static async attemptRecovery(error: BaseError): Promise<any> {
    if (!error.recoveryStrategy || !error.isRecoverable) {
      throw error;
    }

    const strategy = error.recoveryStrategy;

    switch (strategy.type) {
      case 'retry':
        return this.retryOperation(error, strategy);
      case 'fallback':
        return strategy.fallbackValue;
      case 'degrade':
        return this.degradeService(error);
      case 'notify':
        await this.notifyStakeholders(error);
        return null;
      case 'escalate':
        await this.escalateError(error);
        throw error;
      default:
        throw error;
    }
  }

  private static async retryOperation(error: BaseError, strategy: RecoveryStrategy): Promise<any> {
    const maxRetries = strategy.maxRetries || 3;
    const delay = strategy.delay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // In a real implementation, this would retry the actual operation
        // For now, we'll just simulate a successful retry
        this.logger.info(`Retry attempt ${attempt} for ${error.context.operation}`);
        return { success: true, attempt };
      } catch (retryError) {
        if (attempt === maxRetries) {
          throw retryError;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private static async degradeService(error: BaseError): Promise<any> {
    this.logger.warn(`Degrading service due to error: ${error.message}`);
    // Implement service degradation logic here
    return { degraded: true, message: 'Service operating in degraded mode' };
  }

  private static async notifyStakeholders(error: BaseError): Promise<void> {
    this.logger.info(`Notifying stakeholders about error: ${error.message}`);
    // Implement notification logic here (email, Slack, etc.)
  }

  private static async escalateError(error: BaseError): Promise<void> {
    this.logger.error(`Escalating critical error: ${error.message}`);
    // Implement escalation logic here (alert management, on-call, etc.)
  }
}

// Error Boundary Helper for async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallbackValue?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const baseError = ErrorHandler.handle(error, context);

    if (baseError.isRecoverable && fallbackValue !== undefined) {
      try {
        return await ErrorHandler.attemptRecovery(baseError);
      } catch (recoveryError) {
        // Recovery failed, return fallback
        return fallbackValue;
      }
    }

    throw baseError;
  }
}

// Synchronous error handling helper
export function withSyncErrorHandling<T>(
  operation: () => T,
  context: ErrorContext,
  fallbackValue?: T
): T {
  try {
    return operation();
  } catch (error) {
    const baseError = ErrorHandler.handle(error, context);

    if (baseError.isRecoverable && fallbackValue !== undefined) {
      try {
        return ErrorHandler.attemptRecovery(baseError);
      } catch (recoveryError) {
        // Recovery failed, return fallback
        return fallbackValue;
      }
    }

    throw baseError;
  }
}

// Utility function to create error context
export function createErrorContext(
  service: string,
  operation: string,
  userId?: string,
  sessionId?: string,
  requestId?: string,
  metadata?: Record<string, any>
): ErrorContext {
  return {
    service,
    operation,
    timestamp: new Date(),
    userId,
    sessionId,
    requestId,
    metadata
  };
}
