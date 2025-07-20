import React, { createContext, useContext, useEffect, useState } from 'react';

// Health monitoring context for application-wide health tracking

interface HealthMetrics {
  appStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  memoryUsage: number;
  bundleLoadTime: number;
  apiConnectivity: 'connected' | 'disconnected' | 'slow';
  errorCount: number;
  userSession: {
    sessionId: string;
    startTime: Date;
    pageViews: number;
    errors: string[];
  };
}

interface HealthContextType {
  metrics: HealthMetrics;
  recordError: (error: Error, context?: string) => void;
  recordPageView: (page: string) => void;
  checkHealth: () => Promise<void>;
  isHealthy: boolean;
}

const HealthContext = createContext<HealthContextType | null>(null);

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
};

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    appStatus: 'unknown',
    lastCheck: new Date(),
    responseTime: 0,
    memoryUsage: 0,
    bundleLoadTime: 0,
    apiConnectivity: 'unknown' as any,
    errorCount: 0,
    userSession: {
      sessionId: generateSessionId(),
      startTime: new Date(),
      pageViews: 0,
      errors: [],
    },
  });

  const [isHealthy, setIsHealthy] = useState(true);

  // Generate unique session ID
  function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Record application errors
  const recordError = (error: Error, context = 'unknown') => {
    const errorMessage = `${context}: ${error.message}`;
    
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      userSession: {
        ...prev.userSession,
        errors: [...prev.userSession.errors.slice(-9), errorMessage], // Keep last 10 errors
      },
    }));

    // Log to console for development
    console.error('Health Monitor - Error recorded:', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      sessionId: metrics.userSession.sessionId,
    });

    // Update health status based on error count
    updateHealthStatus();
  };

  // Record page view
  const recordPageView = (page: string) => {
    setMetrics(prev => ({
      ...prev,
      userSession: {
        ...prev.userSession,
        pageViews: prev.userSession.pageViews + 1,
      },
    }));

    // Log page view for analytics
    console.log('Health Monitor - Page view:', {
      page,
      timestamp: new Date().toISOString(),
      sessionId: metrics.userSession.sessionId,
    });
  };

  // Performance monitoring
  const measurePerformance = () => {
    // Memory usage (if available)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Bundle load time from navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const bundleLoadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

    return {
      memoryUsage: memoryUsage / (1024 * 1024), // Convert to MB
      bundleLoadTime,
    };
  };

  // API connectivity check
  const checkApiConnectivity = async (): Promise<'connected' | 'disconnected' | 'slow'> => {
    try {
      const startTime = performance.now();
      
      // Simple connectivity check - try to fetch a small resource
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        return 'disconnected';
      }

      return responseTime > 2000 ? 'slow' : 'connected';
    } catch {
      return 'disconnected';
    }
  };

  // Comprehensive health check
  const checkHealth = async () => {
    const startTime = performance.now();
    
    try {
      const apiConnectivity = await checkApiConnectivity();
      const performanceMetrics = measurePerformance();
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        lastCheck: new Date(),
        responseTime,
        apiConnectivity,
        ...performanceMetrics,
      }));

      updateHealthStatus();
    } catch (error) {
      recordError(error as Error, 'health-check');
    }
  };

  // Update overall health status
  const updateHealthStatus = () => {
    setMetrics(prev => {
      let status: HealthMetrics['appStatus'] = 'healthy';

      // Determine status based on metrics
      if (prev.errorCount > 10) {
        status = 'critical';
      } else if (prev.errorCount > 5 || prev.apiConnectivity === 'disconnected') {
        status = 'warning';
      } else if (prev.apiConnectivity === 'slow' || prev.responseTime > 3000) {
        status = 'warning';
      }

      const healthy = status === 'healthy';
      setIsHealthy(healthy);

      return { ...prev, appStatus: status };
    });
  };

  // Set up periodic health checks
  useEffect(() => {
    // Initial health check
    checkHealth();

    // Periodic health checks every 30 seconds
    const healthInterval = setInterval(checkHealth, 30000);

    // Performance observer for Core Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('Performance entry:', entry.name, entry.duration);
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });

      return () => {
        healthInterval && clearInterval(healthInterval);
        observer.disconnect();
      };
    }

    return () => {
      healthInterval && clearInterval(healthInterval);
    };
  }, []);

  // Global error handling
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      recordError(new Error(event.message), 'unhandled-error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      recordError(new Error(String(event.reason)), 'unhandled-promise-rejection');
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value: HealthContextType = {
    metrics,
    recordError,
    recordPageView,
    checkHealth,
    isHealthy,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export default HealthProvider;
