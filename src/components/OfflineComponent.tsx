import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Database
} from 'lucide-react';

interface OfflineComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const OfflineComponent: React.FC<OfflineComponentProps> = ({ children, fallback }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Simulate sync progress
        setSyncProgress(0);
        const interval = setInterval(() => {
          setSyncProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setLastSyncTime(new Date());
              setWasOffline(false);
              setPendingActions(0);
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      // Simulate pending actions accumulating
      const interval = setInterval(() => {
        if (!navigator.onLine) {
          setPendingActions(prev => prev + Math.floor(Math.random() * 3));
        } else {
          clearInterval(interval);
        }
      }, 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const retryConnection = () => {
    // Force a connection check
    if (navigator.onLine) {
      setIsOnline(true);
    } else {
      // Attempt to fetch a small resource to test connectivity
      fetch('/favicon.ico', { cache: 'no-cache' })
        .then(() => setIsOnline(true))
        .catch(() => setIsOnline(false));
    }
  };

  if (!isOnline) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">You're Offline</CardTitle>
            <CardDescription>
              No internet connection detected. Some features may be limited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Offline Mode Active</AlertTitle>
              <AlertDescription>
                Your actions are being saved locally and will sync when you reconnect.
                {pendingActions > 0 && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>{pendingActions} actions queued for sync</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Available Offline Features:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>View cached security reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Browse vulnerability database</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Review performance metrics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>New scans (will queue for sync)</span>
                </li>
              </ul>
            </div>

            <Button onClick={retryConnection} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sync progress when coming back online
  if (syncProgress > 0 && syncProgress < 100) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="font-medium">Reconnected - Syncing data...</span>
              </div>
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-muted-foreground">{syncProgress}%</span>
              </div>
            </div>
            <Progress value={syncProgress} className="mt-2" />
          </div>
        </div>
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  // Show brief success message after sync
  if (wasOffline && lastSyncTime && Date.now() - lastSyncTime.getTime() < 3000) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Alert className="rounded-none border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Successfully Synced</AlertTitle>
            <AlertDescription>
              All offline actions have been synchronized successfully.
            </AlertDescription>
          </Alert>
        </div>
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for offline status
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Get connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    connectionType,
    isSlowConnection: connectionType === '2g' || connectionType === 'slow-2g'
  };
};

// Offline indicator component
export const OfflineIndicator: React.FC = () => {
  const { isOffline, connectionType } = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="border-orange-200 bg-orange-50 shadow-lg">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Offline Mode</AlertTitle>
        <AlertDescription className="text-xs">
          Limited functionality available
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineComponent;
