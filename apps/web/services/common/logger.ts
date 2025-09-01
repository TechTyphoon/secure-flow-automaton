/**
 * Enhanced Logger Utility for Secure Flow Automaton
 *
 * Features:
 * - Structured logging with different log levels
 * - Context-aware logging with correlation IDs
 * - Performance monitoring and metrics
 * - Configurable output destinations (console, file, external services)
 * - Log filtering and search capabilities
 * - Integration with error handling system
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  service: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  security?: SecurityContext;
  performance?: PerformanceContext;
  audit?: AuditContext;
}

export interface SecurityContext {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  eventType: 'authentication' | 'authorization' | 'access_attempt' | 'data_modification' | 'security_violation' | 'anomaly_detected';
  sourceIp?: string;
  userAgent?: string;
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
  riskScore?: number;
  blockedReason?: string;
}

export interface PerformanceContext {
  responseTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  throughput?: number;
  errorRate?: number;
  queueDepth?: number;
}

export interface AuditContext {
  action: string;
  resource: string;
  resourceType: string;
  beforeState?: any;
  afterState?: any;
  justification?: string;
  compliance?: string[];
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  metrics?: LogMetrics;
  tags?: string[];
}

export interface LogMetrics {
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  requestCount?: number;
  errorCount?: number;
  responseTime?: number;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile?: boolean;
  filePath?: string;
  enableExternal?: boolean;
  externalEndpoint?: string;
  enableMetrics: boolean;
  enableCorrelationId: boolean;
  maxFileSize?: number;
  maxFiles?: number;
}

export class Logger {
  private config: LoggerConfig;
  private correlationId: string | null = null;
  private metrics: Map<string, LogMetrics> = new Map();

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  // Set correlation ID for request tracking
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  // Clear correlation ID
  clearCorrelationId(): void {
    this.correlationId = null;
  }

  // Generate correlation ID
  generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core logging methods
  debug(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.DEBUG, message, context, error);
  }

  info(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.INFO, message, context, error);
  }

  warn(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  // Performance monitoring
  startTimer(operation: string, context?: Partial<LogContext>): () => void {
    const startTime = Date.now();
    const timerId = `${operation}-${Date.now()}`;

    this.metrics.set(timerId, {
      duration: 0,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: 0,
      requestCount: 1
    });

    this.info(`Starting operation: ${operation}`, {
      ...context,
      operation,
      metadata: { ...context?.metadata, timerId, phase: 'start' }
    });

    return () => {
      const duration = Date.now() - startTime;
      const metrics = this.metrics.get(timerId);

      if (metrics) {
        metrics.duration = duration;
        metrics.memoryUsage = this.getMemoryUsage();
      }

      this.info(`Completed operation: ${operation}`, {
        ...context,
        operation,
        metadata: {
          ...context?.metadata,
          timerId,
          duration,
          phase: 'end',
          metrics
        }
      });

      this.metrics.delete(timerId);
    };
  }

  // Security event logging
  security(message: string, context: Partial<LogContext>, securityContext?: Partial<SecurityContext>): void {
    this.log(LogLevel.WARN, `[SECURITY] ${message}`, {
      ...context,
      security: {
        threatLevel: securityContext?.threatLevel || 'low',
        eventType: securityContext?.eventType || 'security_violation',
        sourceIp: securityContext?.sourceIp,
        userAgent: securityContext?.userAgent,
        geoLocation: securityContext?.geoLocation,
        riskScore: securityContext?.riskScore || 0,
        blockedReason: securityContext?.blockedReason
      },
      metadata: {
        ...context.metadata,
        securityEvent: true
      }
    });
  }

  // Performance monitoring
  performance(message: string, context: Partial<LogContext>, performanceContext?: Partial<PerformanceContext>): void {
    this.log(LogLevel.INFO, `[PERFORMANCE] ${message}`, {
      ...context,
      performance: {
        responseTime: performanceContext?.responseTime,
        memoryUsage: performanceContext?.memoryUsage,
        cpuUsage: performanceContext?.cpuUsage,
        throughput: performanceContext?.throughput,
        errorRate: performanceContext?.errorRate,
        queueDepth: performanceContext?.queueDepth
      },
      metadata: {
        ...context.metadata,
        performanceEvent: true
      }
    });
  }

  // Audit logging
  audit(message: string, context: Partial<LogContext>, auditContext?: Partial<AuditContext>): void {
    this.log(LogLevel.INFO, `[AUDIT] ${message}`, {
      ...context,
      audit: {
        action: auditContext?.action || 'unknown',
        resource: auditContext?.resource || '',
        resourceType: auditContext?.resourceType || '',
        beforeState: auditContext?.beforeState,
        afterState: auditContext?.afterState,
        justification: auditContext?.justification,
        compliance: auditContext?.compliance
      },
      metadata: {
        ...context.metadata,
        auditEvent: true
      }
    });
  }

  // Private logging implementation
  private log(level: LogLevel, message: string, context?: Partial<LogContext>, error?: Error): void {
    if (level < this.config.level) {
      return;
    }

    const logContext: LogContext = {
      service: context?.service || 'unknown',
      operation: context?.operation,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
      correlationId: this.correlationId || context?.correlationId,
      timestamp: new Date(),
      metadata: context?.metadata || {}
    };

    const logEntry: LogEntry = {
      level,
      message,
      context: logContext,
      error,
      metrics: this.getCurrentMetrics(),
      tags: this.generateTags(logContext, level)
    };

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Log to file
    if (this.config.enableFile && this.config.filePath) {
      this.logToFile(logEntry);
    }

    // Log to external service
    if (this.config.enableExternal && this.config.externalEndpoint) {
      this.logToExternal(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const levelStr = LogLevel[entry.level].toLowerCase();
    const timestamp = entry.context.timestamp.toISOString();
    const correlationId = entry.context.correlationId ? ` [${entry.context.correlationId}]` : '';
    const service = entry.context.service;
    const operation = entry.context.operation ? `:${entry.context.operation}` : '';

    const logMessage = `${timestamp}${correlationId} [${service}${operation}] ${levelStr.toUpperCase()}: ${entry.message}`;

    const logData = {
      context: entry.context,
      error: entry.error,
      metrics: entry.metrics,
      tags: entry.tags
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, logData);
        break;
      case LogLevel.INFO:
        console.info(logMessage, logData);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, logData);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, logData);
        break;
    }
  }

  private logToFile(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, we'll just use console for demonstration
    console.log('FILE LOG:', JSON.stringify(entry, null, 2));
  }

  private logToExternal(entry: LogEntry): void {
    // In a real implementation, this would send to external logging service
    // For now, we'll just use console for demonstration
    console.log('EXTERNAL LOG:', JSON.stringify(entry, null, 2));
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  private getCurrentMetrics(): LogMetrics {
    return {
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now()
    };
  }

  private generateTags(context: LogContext, level: LogLevel): string[] {
    const tags: string[] = [context.service];

    if (context.operation) {
      tags.push(context.operation);
    }

    if (level >= LogLevel.ERROR) {
      tags.push('error');
    }

    if (context.metadata?.securityEvent) {
      tags.push('security');
    }

    if (context.metadata?.auditEvent) {
      tags.push('audit');
    }

    return tags;
  }

  // Configuration methods
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Metrics and monitoring
  getMetrics(operation?: string): LogMetrics | Map<string, LogMetrics> {
    if (operation) {
      return this.metrics.get(operation) || {};
    }
    return new Map(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Health check
  healthCheck(): boolean {
    try {
      this.debug('Logger health check', { service: 'logger', operation: 'health_check' });
      return true;
    } catch {
      return false;
    }
  }
}

// Global logger instance
let globalLogger: Logger | null = null;

// Default configuration
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  enableExternal: false,
  enableMetrics: true,
  enableCorrelationId: true
};

// Initialize global logger
export function initializeLogger(config?: Partial<LoggerConfig>): Logger {
  globalLogger = new Logger({ ...defaultConfig, ...config });
  return globalLogger;
}

// Get global logger instance
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(defaultConfig);
  }
  return globalLogger;
}

// Convenience functions for global logger
export const logger = {
  setCorrelationId: (id: string) => getLogger().setCorrelationId(id),
  clearCorrelationId: () => getLogger().clearCorrelationId(),
  generateCorrelationId: () => getLogger().generateCorrelationId(),
  debug: (message: string, context?: Partial<LogContext>, error?: Error) =>
    getLogger().debug(message, context, error),
  info: (message: string, context?: Partial<LogContext>, error?: Error) =>
    getLogger().info(message, context, error),
  warn: (message: string, context?: Partial<LogContext>, error?: Error) =>
    getLogger().warn(message, context, error),
  error: (message: string, context?: Partial<LogContext>, error?: Error) =>
    getLogger().error(message, context, error),
  critical: (message: string, context?: Partial<LogContext>, error?: Error) =>
    getLogger().critical(message, context, error),
  security: (message: string, context: Partial<LogContext>, threatLevel?: string) =>
    getLogger().security(message, context, threatLevel),
  audit: (message: string, context: Partial<LogContext>, action?: string) =>
    getLogger().audit(message, context, action),
  startTimer: (operation: string, context?: Partial<LogContext>) =>
    getLogger().startTimer(operation, context)
};

// Export types
export type { LoggerConfig, LogContext, LogEntry, LogMetrics };
