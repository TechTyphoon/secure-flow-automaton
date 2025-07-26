import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { SecurityLogger } from '@/lib/security';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Enhanced Error Boundary with Security Logging and User-Friendly Interface
 * 
 * Security enhancements:
 * - Logs all errors for security monitoring
 * - Prevents information disclosure in error messages
 * - Provides safe fallback UI
 * - Tracks error patterns for threat detection
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to show fallback UI
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error securely (without exposing sensitive information)
    SecurityLogger.logEvent('application_error', {
      errorId,
      message: error.message,
      stack: this.sanitizeStackTrace(error.stack || ''),
      componentStack: this.sanitizeStackTrace(errorInfo.componentStack),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorType: error.name,
      userId: this.getCurrentUserId(),
    });

    // Update state with error information
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Check for suspicious error patterns that might indicate attacks
    this.checkForSuspiciousPatterns(error);
  }

  /**
   * Sanitize stack trace to remove potentially sensitive information
   */
  private sanitizeStackTrace(stack: string): string {
    return stack
      .replace(/file:\/\/\/[^:]+/g, '[FILE_PATH]') // Remove file paths
      .replace(/https?:\/\/[^/]+/g, '[URL]') // Remove URLs
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // Remove IP addresses
      .split('\n')
      .slice(0, 10) // Limit stack trace depth
      .join('\n');
  }

  /**
   * Get current user ID safely
   */
  private getCurrentUserId(): string | undefined {
    try {
      // This would integrate with your auth system
      return 'user_id_placeholder';
    } catch {
      return undefined;
    }
  }

  /**
   * Check for suspicious error patterns that might indicate security issues
   */
  private checkForSuspiciousPatterns(error: Error) {
    const suspiciousPatterns = [
      /script/i,
      /eval/i,
      /injection/i,
      /xss/i,
      /csrf/i,
      /unauthorized/i,
      /permission/i,
    ];

    const message = error.message.toLowerCase();
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(message));

    if (isSuspicious) {
      SecurityLogger.logEvent('suspicious_error_pattern', {
        errorMessage: error.message,
        pattern: 'security_related',
        timestamp: new Date().toISOString(),
      });
    }

    // Check for rapid error succession (potential DoS)
    const errorCount = this.getRecentErrorCount();
    if (errorCount > 10) {
      SecurityLogger.logEvent('rapid_error_succession', {
        errorCount,
        timeWindow: '60s',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get count of recent errors (simplified implementation)
   */
  private getRecentErrorCount(): number {
    try {
      const errorLog = localStorage.getItem('recent_errors') || '[]';
      const errors = JSON.parse(errorLog);
      const oneMinuteAgo = Date.now() - 60000;
      return errors.filter((timestamp: number) => timestamp > oneMinuteAgo).length;
    } catch {
      return 0;
    }
  }

  /**
   * Record error timestamp for rate limiting
   */
  private recordErrorTimestamp() {
    try {
      const errorLog = localStorage.getItem('recent_errors') || '[]';
      const errors = JSON.parse(errorLog);
      const oneMinuteAgo = Date.now() - 60000;
      
      // Keep only recent errors and add current one
      const recentErrors = errors.filter((timestamp: number) => timestamp > oneMinuteAgo);
      recentErrors.push(Date.now());
      
      localStorage.setItem('recent_errors', JSON.stringify(recentErrors));
    } catch {
      // Fail silently if localStorage is not available
    }
  }

  /**
   * Handle error recovery actions
   */
  private handleRetry = () => {
    SecurityLogger.logEvent('error_boundary_retry', {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleHome = () => {
    SecurityLogger.logEvent('error_boundary_home', {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });

    window.location.href = '/';
  };

  private handleReportError = () => {
    SecurityLogger.logEvent('error_report_requested', {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });

    // In a real app, this would open a support ticket or feedback form
    alert(`Error reported. Reference ID: ${this.state.errorId}`);
  };

  render() {
    if (this.state.hasError) {
      // Record error occurrence
      this.recordErrorTimestamp();

      // Show custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default secure error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-700">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p>We encountered an unexpected error. Our team has been notified and is working on a fix.</p>
                {this.state.errorId && (
                  <p className="text-sm text-gray-500 mt-2">
                    Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleHome} 
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                
                <Button 
                  onClick={this.handleReportError} 
                  className="w-full"
                  variant="ghost"
                  size="sm"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              {/* Development mode: Show error details */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-3 bg-gray-50 rounded border text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Development Details (Hidden in Production)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto max-h-32 text-xs bg-gray-100 p-2 rounded">
                        {this.sanitizeStackTrace(this.state.error.stack || '')}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
