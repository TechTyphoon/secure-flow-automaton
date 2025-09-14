import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

interface SecurityAlert {
  id: string;
  type: 'vulnerability' | 'threat' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
}

interface RealtimeMetrics {
  activeUsers: number;
  securityScore: number;
  alertsPerMinute: number;
  systemHealth: number;
}

class RealtimeService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to realtime service');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from realtime service:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  subscribeToAlerts(callback: (alert: SecurityAlert) => void) {
    this.socket?.on('security-alert', callback);
  }

  subscribeToMetrics(callback: (metrics: RealtimeMetrics) => void) {
    this.socket?.on('metrics-update', callback);
  }

  unsubscribeFromAlerts() {
    this.socket?.off('security-alert');
  }

  unsubscribeFromMetrics() {
    this.socket?.off('metrics-update');
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const realtimeService = new RealtimeService();

// React Hook for realtime features
export const useRealtimeAlerts = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    realtimeService.connect();

    const handleAlert = (alert: SecurityAlert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    realtimeService.subscribeToAlerts(handleAlert);

    // Listen for connection status
    const socket = (realtimeService as any).socket;
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      setIsConnected(socket.connected);
    }

    return () => {
      realtimeService.unsubscribeFromAlerts();
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  return { alerts, isConnected };
};

export const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    realtimeService.connect();

    const handleMetrics = (newMetrics: RealtimeMetrics) => {
      setMetrics(newMetrics);
    };

    realtimeService.subscribeToMetrics(handleMetrics);

    const socket = (realtimeService as any).socket;
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      setIsConnected(socket.connected);
    }

    return () => {
      realtimeService.unsubscribeFromMetrics();
      if (socket) {
        socket.off('connect', () => setIsConnected(false));
        socket.off('disconnect', () => setIsConnected(false));
      }
    };
  }, []);

  return { metrics, isConnected };
};
