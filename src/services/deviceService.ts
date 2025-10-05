/**
 * Device Utility Service
 * Generates and manages unique device identifiers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class DeviceService {
  private deviceIdKey = 'device_id';

  /**
   * Generate a unique device ID
   * Uses a combination of timestamp, random values, and platform info
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString();
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const platform = Platform.OS;
    
    return `${platform}_${timestamp}_${random1}${random2}`;
  }

  /**
   * Get device ID - creates one if it doesn't exist
   * Device ID persists across app sessions
   */
  async getDeviceId(): Promise<string> {
    try {
      // Add timeout protection to prevent ANR
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Device ID generation timeout')), 5000);
      });
      
      const deviceIdPromise = this.getDeviceIdInternal();
      
      return await Promise.race([deviceIdPromise, timeoutPromise]);
    } catch (error) {
      console.error('❌ Error managing device ID:', error);
      // Fallback to generating a temporary device ID
      return this.generateDeviceId();
    }
  }
  
  /**
   * Internal method to get device ID
   */
  private async getDeviceIdInternal(): Promise<string> {
    // Check if device ID already exists
    let deviceId = await AsyncStorage.getItem(this.deviceIdKey);
    
    if (!deviceId) {
      // Generate new device ID if it doesn't exist
      deviceId = this.generateDeviceId();
      // Use setItem without await to prevent blocking
      AsyncStorage.setItem(this.deviceIdKey, deviceId).catch(err => {
        console.error('Failed to store device ID:', err);
      });
      console.log('🆔 Generated new device ID:', deviceId);
    } else {
      console.log('🆔 Retrieved existing device ID:', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Clear device ID (useful for testing or logout)
   */
  async clearDeviceId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.deviceIdKey);
      console.log('🧹 Device ID cleared');
    } catch (error) {
      console.error('❌ Error clearing device ID:', error);
    }
  }

  /**
   * Get device info for debugging
   */
  getDeviceInfo(): { platform: string; version: string } {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
    };
  }
}

export const deviceService = new DeviceService();