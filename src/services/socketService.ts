/**
 * Socket Service
 * Handles real-time socket connection and location updates
 */
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationUpdateData {
  order_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number | null;
  heading?: number | null;
  altitude?: number | null;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 5000; // 5 seconds

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No auth token available');
    }

    try {
      this.socket = io('https://devez2ship.xaartech.com/api/driver/socket', {
        auth: {
          token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: this.reconnectInterval,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;

      if (++this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.socket?.disconnect();
      }
    });

    // Add any other socket event listeners here
  }

  sendLocationUpdate(data: LocationUpdateData): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to connect...');
      this.connect().catch(error => {
        console.error('Failed to connect socket for location update:', error);
      });
      return;
    }

    this.socket.emit('location_update', data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Export singleton instance
export const socketService = new SocketService();