import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff,
  Smartphone,
  Monitor,
  Share2,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import usePWA from '@/hooks/usePWA';

const PWAStatus: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOffline,
    isUpdateAvailable,
    offlineActions,
    capabilities,
    installPWA,
    updatePWA,
    requestNotificationPermission,
    subscribeToPushNotifications,
    clearOfflineActions,
    shareContent,
    getAppInfo
  } = usePWA();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [appInfo, setAppInfo] = useState<any>(null);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load app info
    getAppInfo().then(setAppInfo);

    // Show PWA prompt for non-installed users
    if (isInstallable && !isInstalled && !localStorage.getItem('pwa-prompt-dismissed')) {
      setTimeout(() => setShowPWAPrompt(true), 5000);
    }
  }, [isInstallable, isInstalled, getAppInfo]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        setShowPWAPrompt(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updatePWA();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      await subscribeToPushNotifications();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SecureFlow Automaton',
      text: 'Check out this amazing DevSecOps automation platform!',
      url: window.location.origin
    };

    const success = await shareContent(shareData);
    if (!success) {
      // Fallback to copying URL
      navigator.clipboard?.writeText(window.location.origin);
    }
  };

  const dismissPWAPrompt = () => {
    setShowPWAPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatus = () => {
    if (!('connection' in navigator)) return 'Unknown';
    const connection = (navigator as any).connection;
    return `${connection.effectiveType?.toUpperCase() || 'Unknown'} (${connection.downlink || '?'} Mbps)`;
  };

  return (
    <div className="space-y-6">
      {/* PWA Installation Prompt */}
      {showPWAPrompt && (
        <Alert className="border-blue-200 bg-blue-50">
          <Smartphone className="h-4 w-4" />
          <AlertTitle>Install SecureFlow App</AlertTitle>
          <AlertDescription className="mt-2">
            Install SecureFlow as a native app for better performance, offline access, and quick access from your home screen.
            <div className="flex space-x-2 mt-3">
              <Button onClick={handleInstall} disabled={isInstalling} size="sm">
                {isInstalling ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>
              <Button onClick={dismissPWAPrompt} variant="outline" size="sm">
                Maybe Later
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Update Available Alert */}
      {isUpdateAvailable && (
        <Alert className="border-green-200 bg-green-50">
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>App Update Available</AlertTitle>
          <AlertDescription className="mt-2">
            A new version of SecureFlow is available with improved features and security updates.
            <div className="mt-3">
              <Button onClick={handleUpdate} disabled={isUpdating} size="sm">
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Now
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Status */}
      {isOffline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You're Currently Offline</AlertTitle>
          <AlertDescription className="mt-2">
            Some features may be limited. Actions will be synchronized when you're back online.
            {offlineActions.length > 0 && (
              <div className="mt-2">
                <Badge variant="secondary">{offlineActions.length} actions queued for sync</Badge>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* PWA Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installation</CardTitle>
            {isInstalled ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Download className="h-4 w-4 text-gray-400" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isInstalled ? 'Installed' : isInstallable ? 'Available' : 'Not Available'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isInstalled ? 'Running as app' : 'Web version'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            {isOffline ? <WifiOff className="h-4 w-4 text-red-600" /> : <Wifi className="h-4 w-4 text-green-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOffline ? 'Offline' : 'Online'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getConnectionStatus()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            {notificationPermission === 'granted' ? 
              <Bell className="h-4 w-4 text-green-600" /> : 
              <BellOff className="h-4 w-4 text-gray-400" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {notificationPermission}
            </div>
            <p className="text-xs text-muted-foreground">
              Push notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offlineActions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed PWA Information */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="offline">Offline Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Current state and performance information</CardDescription>
            </CardHeader>
            <CardContent>
              {appInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Application Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{appInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{appInfo.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Installation:</span>
                          <Badge variant={appInfo.isInstalled ? "default" : "secondary"}>
                            {appInfo.isInstalled ? 'Installed' : 'Web App'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Worker:</span>
                          <Badge variant={appInfo.serviceWorkerState === 'activated' ? "default" : "secondary"}>
                            {appInfo.serviceWorkerState}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Cache Size:</span>
                          <span className="font-medium">{formatBytes(appInfo.cacheSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offline Actions:</span>
                          <span className="font-medium">{appInfo.offlineActionsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Network</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={isOffline ? "destructive" : "default"}>
                            {isOffline ? 'Offline' : 'Online'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Connection:</span>
                          <span className="font-medium">{getConnectionStatus()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Load Time:</span>
                          <span className="font-medium">
                            {performance.timing ? 
                              `${performance.timing.loadEventEnd - performance.timing.navigationStart}ms` : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span className="font-medium">
                            {(performance as any).memory ? 
                              formatBytes((performance as any).memory.usedJSHeapSize) : 
                              'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PWA Capabilities</CardTitle>
              <CardDescription>Available progressive web app features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(capabilities).map(([feature, supported]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {feature === 'canInstall' && <Download className="h-5 w-5 text-muted-foreground" />}
                      {feature === 'canReceiveNotifications' && <Bell className="h-5 w-5 text-muted-foreground" />}
                      {feature === 'canUseBackgroundSync' && <RefreshCw className="h-5 w-5 text-muted-foreground" />}
                      {feature === 'canUsePeriodicBackgroundSync' && <Clock className="h-5 w-5 text-muted-foreground" />}
                      {feature === 'canShareFiles' && <Share2 className="h-5 w-5 text-muted-foreground" />}
                      {feature === 'hasServiceWorker' && <Settings className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <h4 className="font-medium">
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {getFeatureDescription(feature)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={supported ? "default" : "secondary"}>
                      {supported ? 'Supported' : 'Not Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Actions Queue</CardTitle>
              <CardDescription>
                Actions waiting to be synchronized when connection is restored
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offlineActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No offline actions pending</p>
                  <p className="text-sm">Actions will appear here when you're offline</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {offlineActions.length} actions pending
                    </span>
                    <Button onClick={clearOfflineActions} variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  
                  {offlineActions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {action.type === 'security-scan' && <Shield className="h-4 w-4 text-blue-600" />}
                            {action.type === 'vulnerability-report' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                            {action.type === 'performance-metrics' && <Zap className="h-4 w-4 text-green-600" />}
                            {action.type === 'error-report' && <Activity className="h-4 w-4 text-red-600" />}
                            <span className="font-medium capitalize">
                              {action.type.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Queued {new Date(action.timestamp).toLocaleString()}
                          </p>
                          {action.retryCount > 0 && (
                            <p className="text-xs text-orange-600">
                              Retry attempts: {action.retryCount}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PWA Settings</CardTitle>
              <CardDescription>Configure progressive web app features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Installation */}
                <div className="space-y-3">
                  <h4 className="font-medium">Installation</h4>
                  {isInstalled ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>App is installed</span>
                    </div>
                  ) : isInstallable ? (
                    <Button onClick={handleInstall} disabled={isInstalling}>
                      {isInstalling ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Install App
                        </>
                      )}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Installation not available on this device
                    </p>
                  )}
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive security alerts and updates
                      </p>
                    </div>
                    {notificationPermission === 'granted' ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Button onClick={handleNotificationPermission} size="sm">
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sharing */}
                <div className="space-y-3">
                  <h4 className="font-medium">Sharing</h4>
                  <Button onClick={handleShare} variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share SecureFlow
                  </Button>
                </div>

                {/* Update */}
                {isUpdateAvailable && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Updates</h4>
                    <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
                      {isUpdating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update to Latest Version
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const getFeatureDescription = (feature: string): string => {
  const descriptions: Record<string, string> = {
    canInstall: 'Install app to home screen',
    canReceiveNotifications: 'Receive push notifications',
    canUseBackgroundSync: 'Sync data in background',
    canUsePeriodicBackgroundSync: 'Periodic background updates',
    canShareFiles: 'Share content with other apps',
    hasServiceWorker: 'Offline functionality support'
  };
  
  return descriptions[feature] || 'PWA feature';
};

export default PWAStatus;
