/**
 * Enhanced Security Utilities
 * Provides comprehensive security functions for the application
 */

// Type definitions for better type safety
export interface SecurityLogEntry {
  event: string;
  details: Record<string, unknown>;
  timestamp: string;
  sessionId?: string;
  url?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MonitoringConfig {
  datadog: {
    apiKey?: string;
    appKey?: string;
    endpoint: string;
  };
  newrelic: {
    licenseKey?: string;
    accountId?: string;
    endpoint: string;
  };
  sentry: {
    dsn?: string;
  };
}

export interface DatadogPayload {
  title: string;
  text: string;
  tags: string[];
  alert_type: string;
  source_type_name: string;
}

export interface NewRelicPayload {
  eventType: string;
  timestamp: number;
  event: string;
  details: Record<string, unknown>;
  sessionId?: string;
  url?: string;
}

declare global {
  interface Window {
    Sentry?: {
      captureMessage: (message: string, options: { level: string; extra: Record<string, unknown> }) => void;
    };
  }
}

// Session management configuration
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  TIMEOUT: 30 * 60 * 1000,
  // Refresh token before expiry (5 minutes buffer)
  REFRESH_BUFFER: 5 * 60 * 1000,
  // Maximum session duration (24 hours)
  MAX_DURATION: 24 * 60 * 60 * 1000,
  // Session storage key
  STORAGE_KEY: 'sfa_session',
} as const;

/**
 * Rate limiting utility for preventing abuse
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if a request is allowed based on rate limiting rules
   * @param identifier - Unique identifier for the client (IP, user ID, etc.)
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    // If no record exists or window has expired, create new record
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    // If within window and under limit, increment and allow
    if (record.count < maxAttempts) {
      record.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Reset rate limiting for a specific identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Get current attempt count for an identifier
   */
  getAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    return record ? record.count : 0;
  }

  /**
   * Clean up expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(identifier);
      }
    }
  }
}

/**
 * Enhanced session timeout management
 */
export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  constructor(
    private onTimeout: () => void,
    private onWarning: () => void,
    private timeoutDuration: number = SESSION_CONFIG.TIMEOUT
  ) {
    this.resetTimeout();
    this.setupActivityListeners();
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  private handleActivity(): void {
    this.lastActivity = Date.now();
    this.resetTimeout();
  }

  private resetTimeout(): void {
    // Clear existing timeouts
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

    // Set warning timeout (5 minutes before session expires)
    this.warningTimeoutId = setTimeout(() => {
      this.onWarning();
    }, this.timeoutDuration - 5 * 60 * 1000);

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.onTimeout();
    }, this.timeoutDuration);
  }

  public extendSession(): void {
    this.resetTimeout();
  }

  public destroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
  }
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize SQL input to prevent injection attacks
 */
export function sanitizeSqlInput(input: string): string {
  // Remove SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    /(['";])/g,
    /(--)/g,
    /(\/\*|\*\/)/g,
    /(xp_|sp_)/gi
  ];

  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
}

/**
 * Hash a string using SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Security Logger for tracking security events
 */
export class SecurityLogger {
  private static monitoringConfig: MonitoringConfig = {
    datadog: {
      endpoint: 'https://api.datadoghq.com/api/v1/events'
    },
    newrelic: {
      endpoint: 'https://insights-collector.newrelic.com/v1/accounts'
    },
    sentry: {}
  };

  /**
   * Log a security event
   */
  static logEvent(event: string, details: Record<string, unknown> = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const logEntry: SecurityLogEntry = {
      event,
      details,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      url: window.location.href,
      userId: this.getCurrentUserId(),
      severity
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('🔒 Security Event:', logEntry);
    }

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(logEntry);
    }
  }

  private static async sendToMonitoringService(logEntry: SecurityLogEntry): Promise<void> {
    try {
      // Try Datadog first
      if (this.monitoringConfig.datadog.apiKey) {
        await this.sendToDatadog(logEntry);
        return;
      }

      // Try New Relic
      if (this.monitoringConfig.newrelic.licenseKey) {
        await this.sendToNewRelic(logEntry);
        return;
      }

      // Try Sentry
      if (this.monitoringConfig.sentry.dsn) {
        await this.sendToSentry(logEntry);
        return;
      }

      // Fallback to internal API
      await fetch('/api/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(console.error);

    } catch (error) {
      console.error('Failed to send security event to monitoring service:', error);
    }
  }

  private static async sendToDatadog(logEntry: SecurityLogEntry): Promise<void> {
    const payload: DatadogPayload = {
      title: `Security Event: ${logEntry.event}`,
      text: JSON.stringify(logEntry.details),
      tags: ['security', 'automaton', logEntry.event],
      alert_type: 'info',
      source_type_name: 'secure-flow-automaton'
    };

    const response = await fetch(this.monitoringConfig.datadog.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.monitoringConfig.datadog.apiKey!,
        'DD-APPLICATION-KEY': this.monitoringConfig.datadog.appKey!
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Datadog API error: ${response.status}`);
    }
  }

  private static async sendToNewRelic(logEntry: SecurityLogEntry): Promise<void> {
    const payload: NewRelicPayload = {
      eventType: 'SecurityEvent',
      timestamp: Date.now(),
      event: logEntry.event,
      details: logEntry.details,
      sessionId: logEntry.sessionId,
      url: logEntry.url
    };

    const response = await fetch(`${this.monitoringConfig.newrelic.endpoint}/${this.monitoringConfig.newrelic.accountId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insert-Key': this.monitoringConfig.newrelic.licenseKey!
      },
      body: JSON.stringify([payload])
    });

    if (!response.ok) {
      throw new Error(`New Relic API error: ${response.status}`);
    }
  }

  private static async sendToSentry(logEntry: SecurityLogEntry): Promise<void> {
    // Sentry is typically initialized globally, so we just capture the message
    if (window.Sentry) {
      window.Sentry.captureMessage(`Security Event: ${logEntry.event}`, {
        level: 'info',
        extra: logEntry.details
      });
    }
  }

  private static getSessionId(): string | undefined {
    // Get session ID from localStorage or sessionStorage
    return localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId') || undefined;
  }

  private static getCurrentUserId(): string | undefined {
    // Get current user ID from auth context or localStorage
    return localStorage.getItem('userId') || undefined;
  }
}

export default SecurityLogger;
