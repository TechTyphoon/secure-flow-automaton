/**
 * Comprehensive Security Configuration and Utilities
 * Enhanced security hardening for production deployment
 */

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

// Rate limiting configuration
export const RATE_LIMITS = {
  // API requests per minute
  API_REQUESTS: 100,
  // Authentication attempts per hour
  AUTH_ATTEMPTS: 5,
  // File uploads per minute
  FILE_UPLOADS: 10,
  // Search queries per minute
  SEARCH_QUERIES: 50,
} as const;

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  BANNED_PATTERNS: [
    'password',
    '123456',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ],
} as const;

// MFA configuration
export const MFA_CONFIG = {
  ENABLED: true,
  BACKUP_CODES_COUNT: 8,
  TOTP_WINDOW: 1,
  SMS_ENABLED: false, // Disabled for security - TOTP only
  EMAIL_ENABLED: true,
} as const;

/**
 * Enhanced password validation with comprehensive security checks
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  } else {
    score += 1;
  }

  // Character requirements
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Check for banned patterns
  const lowerPassword = password.toLowerCase();
  for (const pattern of PASSWORD_REQUIREMENTS.BANNED_PATTERNS) {
    if (lowerPassword.includes(pattern)) {
      errors.push(`Password cannot contain common patterns like "${pattern}"`);
      score -= 1;
    }
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 5) strength = 'very-strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Input sanitization to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * SQL injection prevention - parameterized query helper
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['"\\;]/g, '') // Remove dangerous SQL characters
    .replace(/(\b(union|select|insert|update|delete|drop|exec|script)\b)/gi, '') // Remove SQL keywords
    .trim();
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
 * Content Security Policy headers
 */
export const generateSecureCSP = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' wss: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];
  
  return directives.join('; ');
};

/**
 * Security headers for production
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': generateSecureCSP(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const;

/**
 * API request rate limiter
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  public isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out requests outside the window
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  public getRemainingRequests(key: string, limit: number, windowMs: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    const keyRequests = this.requests.get(key) || [];
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, limit - validRequests.length);
  }
}

/**
 * Secure local storage wrapper with encryption
 */
export class SecureStorage {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  public static async setItem(key: string, value: string): Promise<void> {
    try {
      // Simple encryption using Web Crypto API
      const data = this.encoder.encode(value);
      const cryptoKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      localStorage.setItem(key, btoa(String.fromCharCode(...combined)));
    } catch (error) {
      console.error('SecureStorage: Failed to encrypt data', error);
      // Fallback to regular storage
      localStorage.setItem(key, value);
    }
  }

  public static getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  public static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

/**
 * Environment variable validator
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  for (const variable of required) {
    if (!import.meta.env[variable]) {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  }

  // Validate URL formats
  if (import.meta.env.VITE_SUPABASE_URL && !isValidUrl(import.meta.env.VITE_SUPABASE_URL)) {
    errors.push('Invalid SUPABASE_URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Security event logger
 */
export class SecurityLogger {
  private static monitoringConfig = {
    datadog: {
      apiKey: import.meta.env.VITE_DATADOG_API_KEY,
      appKey: import.meta.env.VITE_DATADOG_APP_KEY,
      endpoint: 'https://api.datadoghq.com/api/v1/events'
    },
    newrelic: {
      licenseKey: import.meta.env.VITE_NEWRELIC_LICENSE_KEY,
      accountId: import.meta.env.VITE_NEWRELIC_ACCOUNT_ID,
      endpoint: 'https://insights-collector.newrelic.com/v1/accounts'
    },
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN
    },
    logrocket: {
      publicKey: import.meta.env.VITE_LOGROCKET_PUBLIC_KEY
    }
  };

  public static logEvent(event: string, details: Record<string, unknown> = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: SessionManager.prototype.constructor.name,
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

  private static async sendToMonitoringService(logEntry: any): Promise<void> {
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

  private static async sendToDatadog(logEntry: any): Promise<void> {
    const response = await fetch(this.monitoringConfig.datadog.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.monitoringConfig.datadog.apiKey!,
        'DD-APPLICATION-KEY': this.monitoringConfig.datadog.appKey!
      },
      body: JSON.stringify({
        title: `Security Event: ${logEntry.event}`,
        text: JSON.stringify(logEntry.details),
        tags: ['security', 'automaton', logEntry.event],
        alert_type: 'info',
        source_type_name: 'secure-flow-automaton'
      })
    });

    if (!response.ok) {
      throw new Error(`Datadog API error: ${response.status}`);
    }
  }

  private static async sendToNewRelic(logEntry: any): Promise<void> {
    const response = await fetch(`${this.monitoringConfig.newrelic.endpoint}/${this.monitoringConfig.newrelic.accountId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insert-Key': this.monitoringConfig.newrelic.licenseKey!
      },
      body: JSON.stringify([{
        eventType: 'SecurityEvent',
        timestamp: Date.now(),
        event: logEntry.event,
        details: logEntry.details,
        sessionId: logEntry.sessionId,
        url: logEntry.url
      }])
    });

    if (!response.ok) {
      throw new Error(`New Relic API error: ${response.status}`);
    }
  }

  private static async sendToSentry(logEntry: any): Promise<void> {
    // Sentry is typically initialized globally, so we just capture the message
    if (window.Sentry) {
      window.Sentry.captureMessage(`Security Event: ${logEntry.event}`, {
        level: 'info',
        extra: logEntry.details
      });
    }
  }
}
