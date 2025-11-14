/**
 * Simple Location Service
 * Clean, minimal implementation for sending location to API
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

class SimpleLocationService {
  private static instance: SimpleLocationService;
  private isTracking = false;
  private watchId: number | null = null;

  static getInstance(): SimpleLocationService {
    if (!SimpleLocationService.instance) {
      SimpleLocationService.instance = new SimpleLocationService();
    }
    return SimpleLocationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // For iOS, request through geolocation service
      const result = await Geolocation.requestAuthorization('whenInUse');
      return result === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * Send location to API
   */
  async sendLocationToAPI(latitude: number, longitude: number): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      const response = await fetch('https://devez2ship.xaartech.com/api/driver/tracking/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      const success = response.ok;
      console.log(`📍 Location sent to API: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (success) {
        const data = await response.json();
        console.log('API Response:', data);
      }
      
      return success;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }

  /**
   * Start continuous location tracking
   */
  async startTracking(): Promise<void> {
    if (this.isTracking) {
      console.log('⚠️ Already tracking location');
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.error('❌ Location permission denied');
      return;
    }

    console.log('🚀 Starting location tracking...');
    this.isTracking = true;

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Location update: ${latitude}, ${longitude}`);
        
        // Send to API
        this.sendLocationToAPI(latitude, longitude);
      },
      (error) => {
        console.error('❌ Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        interval: 30000, // Update every 30 seconds
        fastestInterval: 10000, // Fastest update every 10 seconds
        distanceFilter: 10, // Update when moved at least 10 meters
      }
    );
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    if (!this.isTracking) {
      console.log('📍 Location tracking not active');
      return;
    }

    console.log('🛑 Stopping location tracking...');
    
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
  }

  /**
   * Test the service by getting location once and sending to API
   */
  async testService(): Promise<void> {
    console.log('🧪 Testing Simple Location Service...');
    
    const location = await this.getCurrentLocation();
    if (location) {
      console.log(`📍 Got location: ${location.latitude}, ${location.longitude}`);
      await this.sendLocationToAPI(location.latitude, location.longitude);
    } else {
      console.log('❌ Failed to get location');
    }
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export default SimpleLocationService;