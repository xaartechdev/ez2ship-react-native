/**
 * Custom React Hook for Socket.IO Connection Management
 * Provides real-time socket connection status and event handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService, SocketEventCallbacks } from '../services/socketService';

export interface SocketStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  socketId: string | null;
  reconnectAttempts: number;
  driverId: string | null;
}

export const useSocket = () => {
  const [status, setStatus] = useState<SocketStatus>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    socketId: null,
    reconnectAttempts: 0,
    driverId: null,
  });

  const callbacksRef = useRef<SocketEventCallbacks>({});

  // Update socket status from connection info
  const updateStatus = useCallback(() => {
    const connectionInfo = socketService.getConnectionInfo() as any;
    const isConnected = socketService.isSocketConnected();

    setStatus({
      isConnected,
      isConnecting: false, // Reset connecting state when we get an update
      connectionError: null, // Clear error on successful update
      socketId: connectionInfo.socketId || null,
      reconnectAttempts: connectionInfo.reconnectAttempts || 0,
      driverId: connectionInfo.driverId || null,
    });
  }, []);

  // Set up socket event callbacks
  useEffect(() => {
    const callbacks: SocketEventCallbacks = {
      onConnect: () => {
        console.log('📱 HOOK - Socket connected');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionError: null,
        }));
        updateStatus();
        callbacksRef.current.onConnect?.();
      },

      onDisconnect: (reason: string) => {
        console.log('📱 HOOK - Socket disconnected:', reason);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        updateStatus();
        callbacksRef.current.onDisconnect?.(reason);
      },

      onError: (error: Error) => {
        console.error('📱 HOOK - Socket error:', error.message);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError: error.message,
        }));
        callbacksRef.current.onError?.(error);
      },

      onLocationUpdateSuccess: (data: any) => {
        console.log('📱 HOOK - Location update success:', data);
        callbacksRef.current.onLocationUpdateSuccess?.(data);
      },

      onLocationUpdateError: (error: any) => {
        console.error('📱 HOOK - Location update error:', error);
        callbacksRef.current.onLocationUpdateError?.(error);
      },

      onOrderUpdate: (orderData: any) => {
        console.log('📱 HOOK - Order update received:', orderData);
        callbacksRef.current.onOrderUpdate?.(orderData);
      }
    };

    socketService.setCallbacks(callbacks);
    updateStatus(); // Initial status update

    return () => {
      // Clean up callbacks
      socketService.setCallbacks({});
    };
  }, [updateStatus]);

  // Connect to socket
  const connect = useCallback(async () => {
    setStatus(prev => ({
      ...prev,
      isConnecting: true,
      connectionError: null,
    }));

    try {
      const connected = await socketService.connect();
      if (!connected) {
        setStatus(prev => ({
          ...prev,
          isConnecting: false,
          connectionError: 'Failed to establish connection',
        }));
      }
      return connected;
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: error.message || 'Connection failed',
      }));
      return false;
    }
  }, []);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Force reconnection
  const forceReconnect = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isConnecting: true,
      connectionError: null,
    }));
    socketService.forceReconnect();
  }, []);

  // Send location update
  const sendLocationUpdate = useCallback((locationData: any) => {
    return socketService.sendLocationUpdate(locationData);
  }, []);

  // Update driver status
  const updateDriverStatus = useCallback((status: 'available' | 'busy' | 'offline') => {
    return socketService.updateDriverStatus(status);
  }, []);

  // Set custom event callbacks
  const setEventCallbacks = useCallback((callbacks: Partial<SocketEventCallbacks>) => {
    callbacksRef.current = { ...callbacksRef.current, ...callbacks };
  }, []);

  return {
    // Status
    status,
    isConnected: status.isConnected,
    isConnecting: status.isConnecting,
    connectionError: status.connectionError,
    socketId: status.socketId,
    
    // Actions
    connect,
    disconnect,
    forceReconnect,
    sendLocationUpdate,
    updateDriverStatus,
    setEventCallbacks,
    
    // Utils
    getConnectionInfo: socketService.getConnectionInfo.bind(socketService),
  };
};