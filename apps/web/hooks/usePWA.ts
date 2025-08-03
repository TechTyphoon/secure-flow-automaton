import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: any;
  swRegistration: ServiceWorkerRegistration | null;
}

interface OfflineAction {
  id: string;
  type: 'security-scan' | 'vulnerability-report' | 'performance-metrics' | 'error-report';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface PWACapabilities {
  canInstall: boolean;
  canReceiveNotifications: boolean;
  canUseBackgroundSync: boolean;
  canUsePeriodicBackgroundSync: boolean;
  canShareFiles: boolean;
  hasServiceWorker: boolean;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
    swRegistration: null
  });

  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    canReceiveNotifications: false,
    canUseBackgroundSync: false,
    canUsePeriodicBackgroundSync: false,
    canShareFiles: false,
    hasServiceWorker: 'serviceWorker' in navigator
  });

  // Initialize PWA features
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('Service Worker registered successfully:', registration);
          
          setPwaState(prev => ({
            ...prev,
            swRegistration: registration
          }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({
                    ...prev,
                    isUpdateAvailable: true
                  }));
                }
              });
            }
          });

          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Message from service worker:', event.data);
            
            if (event.data.type === 'OFFLINE_ACTION_QUEUED') {
              addOfflineAction(event.data.action);
            }
            
            if (event.data.type === 'SYNC_COMPLETED') {
              removeOfflineAction(event.data.actionId);
            }
          });
        }

        // Check if app is installed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                           window.matchMedia('(display-mode: fullscreen)').matches ||
                           (window.navigator as any).standalone === true;

        setPwaState(prev => ({
          ...prev,
          isInstalled
        }));

        // Detect capabilities
        const newCapabilities: PWACapabilities = {
          canInstall: 'beforeinstallprompt' in window,
          canReceiveNotifications: 'Notification' in window && 'serviceWorker' in navigator,
          canUseBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
          canUsePeriodicBackgroundSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
          canShareFiles: 'share' in navigator && 'canShare' in navigator,
          hasServiceWorker: 'serviceWorker' in navigator
        };

        setCapabilities(newCapabilities);

      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    initializePWA();

    // Listen for network status changes
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOffline: false }));
      // Trigger sync when coming back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRIGGER_SYNC'
        });
      }
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: event
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app install
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) {
      return false;
    }

    try {
      pwaState.installPrompt.prompt();
      const result = await pwaState.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted');
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      } else {
        console.log('PWA installation declined');
        return false;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }, [pwaState.installPrompt]);

  // Update PWA
  const updatePWA = useCallback(async () => {
    if (!pwaState.swRegistration) {
      return false;
    }

    try {
      // Send skip waiting message to service worker
      if (pwaState.swRegistration.waiting) {
        pwaState.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new service worker to take control
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            resolve();
          }, { once: true });
        });

        // Reload the page
        window.location.reload();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA update failed:', error);
      return false;
    }
  }, [pwaState.swRegistration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (!pwaState.swRegistration || !('PushManager' in window)) {
      return null;
    }

    try {
      const subscription = await pwaState.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY // You'll need to add this
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, [pwaState.swRegistration]);

  // Add offline action
  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setOfflineActions(prev => [...prev, newAction]);
    
    // Store in IndexedDB via service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_OFFLINE_ACTION',
        action: newAction
      });
    }
  }, []);

  // Remove offline action
  const removeOfflineAction = useCallback((actionId: string) => {
    setOfflineActions(prev => prev.filter(action => action.id !== actionId));
  }, []);

  // Clear all offline actions
  const clearOfflineActions = useCallback(() => {
    setOfflineActions([]);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_OFFLINE_ACTIONS'
      });
    }
  }, []);

  // Check if feature is supported
  const isFeatureSupported = useCallback((feature: keyof PWACapabilities) => {
    return capabilities[feature];
  }, [capabilities]);

  // Share content
  const shareContent = useCallback(async (shareData: ShareData) => {
    if (!('share' in navigator)) {
      return false;
    }

    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, []);

  // Get app info
  const getAppInfo = useCallback(async () => {
    const info = {
      name: 'SecureFlow Automaton',
      version: '1.0.0',
      isInstalled: pwaState.isInstalled,
      isOffline: pwaState.isOffline,
      serviceWorkerState: pwaState.swRegistration?.active?.state || 'not-registered',
      cacheSize: 0,
      offlineActionsCount: offlineActions.length
    };

    // Get cache size if possible
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        info.cacheSize = estimate.usage || 0;
      } catch (error) {
        console.error('Storage estimate failed:', error);
      }
    }

    return info;
  }, [pwaState, offlineActions]);

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: () => Promise<any>) => {
    return async (...args: any[]) => {
      const startTime = performance.now();
      
      try {
        const result = await fn.apply(null, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Send performance data to service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PERFORMANCE_MEASURE',
            name,
            duration,
            timestamp: Date.now()
          });
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log error performance
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PERFORMANCE_ERROR',
            name,
            duration,
            error: error.message,
            timestamp: Date.now()
          });
        }
        
        throw error;
      }
    };
  }, []);

  return {
    // State
    ...pwaState,
    offlineActions,
    capabilities,
    
    // Actions
    installPWA,
    updatePWA,
    requestNotificationPermission,
    subscribeToPushNotifications,
    addOfflineAction,
    removeOfflineAction,
    clearOfflineActions,
    shareContent,
    
    // Utilities
    isFeatureSupported,
    getAppInfo,
    measurePerformance
  };
};

export default usePWA;
