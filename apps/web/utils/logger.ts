// Production-safe logging utility

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.VITE_DEBUG_SECURITY === 'true';

export class Logger {
  private static instance: Logger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]) {
    if (isDevelopment && isDebugEnabled && this.shouldLog('debug')) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`❌ [ERROR] ${message}`, ...args);
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common logging patterns
export const logSecurity = (message: string, ...args: any[]) => {
  logger.info(`🔒 [SECURITY] ${message}`, ...args);
};

export const logPerformance = (message: string, ...args: any[]) => {
  logger.debug(`⚡ [PERF] ${message}`, ...args);
};

export const logQuantum = (message: string, ...args: any[]) => {
  logger.debug(`🌌 [QUANTUM] ${message}`, ...args);
}; 