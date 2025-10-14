/**
 * Location Tracking Service
 * Handles real-time location tracking for delivery orders
 * Automatically starts when order status changes to 'in_transit'
 */

import { Platform, AppState, Alert } from 'react-native';
import Geolocation from './geolocationSafe';

// Local Geolocation types (react-native-geolocation-service may not export TS types)
interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  altitude?: number | null;
}

interface GeolocationResponse {
  coords: GeolocationCoords;
  timestamp: number;
}

import { check, request, PERMISSIONS, RESULTS, requestMultiple } from './permissionsSafe';
import { apiClient } from './apiClient';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
  altitude?: number | null;
}

export interface LocationUpdateRequest {
  order_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number | null;
  heading?: number | null;
  altitude?: number | null;
}

class LocationTrackingService {
  private isTracking: boolean = false;
  private watchId: number | null = null;
  private currentOrderId: string | null = null;
  private lastKnownLocation: LocationData | null = null;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private locationBuffer: LocationData[] = [];
  private minDistanceForUpdate: number = 10; // meters
  private updateIntervalMs: number = 5000; // 5 seconds

  constructor() {
    this.setupAppStateListener();
  }

  /**
   * Setup app state listener to handle background/foreground transitions
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && this.isTracking) {
        console.log('📱 App backgrounded, continuing location tracking...');
      } else if (nextAppState === 'active' && this.isTracking) {
        console.log('📱 App foregrounded, location tracking active');
      }
    });
  }

  /**
   * Request location permissions for Android and iOS
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      console.log('📍 Requesting location permissions...');

      if (Platform.OS === 'android') {
        const permissions = [
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ];

        const results = await requestMultiple(permissions);
        
        const fineLocationGranted = results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED;
        const coarseLocationGranted = results[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;

        if (fineLocationGranted || coarseLocationGranted) {
          // Request background location permission separately (Android 10+)
          if (Platform.Version >= 29) {
            const backgroundResult = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
            console.log('📍 Background location permission:', backgroundResult);
          }
          
          console.log('✅ Location permissions granted for Android');
          return true;
        } else {
          console.log('❌ Location permissions denied for Android');
          return false;
        }
      } else if (Platform.OS === 'ios') {
        const whenInUseResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        if (whenInUseResult === RESULTS.GRANTED) {
          // Request always permission for background tracking
          const alwaysResult = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
          console.log('📍 iOS location permissions:', { whenInUse: whenInUseResult, always: alwaysResult });
          return true;
        } else {
          console.log('❌ Location permissions denied for iOS');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasLocationPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const fineLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const coarseLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
        
        return fineLocationCheck === RESULTS.GRANTED || coarseLocationCheck === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const locationCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return locationCheck === RESULTS.GRANTED;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Start location tracking for a specific order
   */
  async startTracking(orderId: string): Promise<boolean> {
    try {
      console.log(`🚀 Starting location tracking for order: ${orderId}`);

      if (this.isTracking) {
        console.log('⚠️ Location tracking already active');
        return true;
      }

      // Check permissions first
      console.log('🔍 Checking location permissions...');
      const hasPermissions = await this.hasLocationPermissions();
      console.log('📍 Current permissions status:', hasPermissions);
      
      if (!hasPermissions) {
        console.log('⚠️ Location permissions not granted, requesting...');
        const granted = await this.requestLocationPermissions();
        console.log('📍 Permission request result:', granted);
        
        if (!granted) {
          console.log('❌ Location permissions not granted - cannot start tracking');
          console.log('💡 SOLUTION: Go to device Settings > Apps > Ez2ship > Permissions > Location > Allow');
          
          Alert.alert(
            'Location Permission Required',
            'Ez2ship needs location access to track deliveries. Please grant location permission in your device settings.\n\nSettings > Apps > Ez2ship > Permissions > Location > Allow',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  // Open device settings (requires react-native-permissions linking)
                  try {
                    const { openSettings } = require('react-native-permissions');
                    openSettings();
                  } catch (error) {
                    console.log('Cannot open settings automatically - user must do it manually');
                  }
                }
              }
            ]
          );
          return false;
        }
      }

      this.currentOrderId = orderId;
      this.isTracking = true;
      this.locationBuffer = [];

      // Configure Geolocation options
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
        distanceFilter: 5, // Update every 5 meters
        interval: 5000, // Check every 5 seconds
        fastestInterval: 2000, // Fastest update every 2 seconds
      };

      // Start watching position
      this.watchId = Geolocation.watchPosition(
        (position: GeolocationResponse) => {
          this.handleLocationUpdate(position);
        },
        (error) => {
          console.error('❌ Location error:', error);
          this.handleLocationError(error);
        },
        geoOptions
      );

      // Start periodic updates
      this.startPeriodicUpdates();

      console.log('✅ Location tracking started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    console.log('🛑 Stopping location tracking...');

    this.isTracking = false;
    this.currentOrderId = null;

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Send any remaining buffered locations
    this.flushLocationBuffer();

    console.log('✅ Location tracking stopped');
  }

  /**
   * Handle location updates from Geolocation
   */
  private handleLocationUpdate(position: GeolocationResponse): void {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      speed: position.coords.speed,
      heading: position.coords.heading,
      altitude: position.coords.altitude,
    };

    console.log('📍 New location:', {
      lat: locationData.latitude.toFixed(6),
      lng: locationData.longitude.toFixed(6),
      accuracy: locationData.accuracy
    });

    // Check if location has changed significantly
    if (this.shouldUpdateLocation(locationData)) {
      this.locationBuffer.push(locationData);
      this.lastKnownLocation = locationData;
    }
  }

  /**
   * Handle location errors
   */
  private handleLocationError(error: any): void {
    console.error('❌ Geolocation error:', error);
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        console.log('❌ Location access denied');
        // Alert removed for testing - just log the error
        break;
      case 2: // POSITION_UNAVAILABLE
        console.log('⚠️ Location temporarily unavailable');
        break;
      case 3: // TIMEOUT
        console.log('⚠️ Location request timeout');
        break;
      default:
        console.log('⚠️ Unknown location error');
    }
  }

  /**
   * Check if location update should be sent based on distance and time
   */
  private shouldUpdateLocation(newLocation: LocationData): boolean {
    if (!this.lastKnownLocation) {
      return true; // First location always gets sent
    }

    // Calculate distance from last known location
    const distance = this.calculateDistance(
      this.lastKnownLocation.latitude,
      this.lastKnownLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    // Send update if moved more than minimum distance or if it's been a while
    const timeDiff = newLocation.timestamp - this.lastKnownLocation.timestamp;
    const shouldUpdate = distance >= this.minDistanceForUpdate || timeDiff >= this.updateIntervalMs;

    if (shouldUpdate) {
      console.log(`📍 Location update triggered: distance=${distance.toFixed(2)}m, time=${timeDiff}ms`);
    }

    return shouldUpdate;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Start periodic updates to send buffered locations
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(() => {
      if (this.locationBuffer.length > 0) {
        console.log(`📊 Sending ${this.locationBuffer.length} buffered location updates`);
        this.flushLocationBuffer();
      } else {
        console.log('📊 Location tracking active - no new locations to send');
      }
      
      // Log current tracking status for monitoring
      console.log('🔄 BACKGROUND TRACKING STATUS:', {
        isTracking: this.isTracking,
        orderId: this.currentOrderId,
        bufferSize: this.locationBuffer.length,
        hasLastLocation: !!this.lastKnownLocation,
        watchId: this.watchId !== null
      });
    }, this.updateIntervalMs);
  }

  /**
   * Send buffered locations to server
   */
  private async flushLocationBuffer(): Promise<void> {
    if (this.locationBuffer.length === 0 || !this.currentOrderId) {
      return;
    }

    const locationsToSend = [...this.locationBuffer];
    this.locationBuffer = []; // Clear buffer

    try {
      console.log(`🌐 Sending ${locationsToSend.length} location updates for order ${this.currentOrderId}`);

      for (const location of locationsToSend) {
        const locationUpdate: LocationUpdateRequest = {
          order_id: this.currentOrderId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date(location.timestamp).toISOString(),
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
        };

        await this.sendLocationUpdate(locationUpdate);
      }
    } catch (error) {
      console.error('❌ Error sending location updates:', error);
      // Re-add failed updates back to buffer for retry
      this.locationBuffer.unshift(...locationsToSend);
    }
  }

  /**
   * Send single location update to server
   */
  private async sendLocationUpdate(locationData: LocationUpdateRequest): Promise<void> {
    try {
      console.log('📍 Location data prepared for sending:', locationData);
      console.log('🚀 Sending location update to: /driver/location-update');
      
      // Send location update to API
      const response = await apiClient.post('/driver/location-update', locationData);
      
      if (response.success) {
        console.log('✅ Location update sent successfully');
      } else {
        console.error('❌ Failed to send location update:', response.message);
        throw new Error(response.message);
      }
      
    } catch (error) {
      console.error('❌ Error sending location update:', error);
      // Don't throw error to avoid stopping location tracking during testing
      // Just log the error and continue tracking
    }
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): { isTracking: boolean; orderId: string | null; lastLocation: LocationData | null } {
    return {
      isTracking: this.isTracking,
      orderId: this.currentOrderId,
      lastLocation: this.lastKnownLocation,
    };
  }

  /**
   * Force immediate location update
   */
  async forceLocationUpdate(): Promise<void> {
    if (!this.isTracking || !this.currentOrderId) {
      console.log('⚠️ No active tracking to force update');
      return;
    }

    try {
      const position = await new Promise<GeolocationResponse>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
        );
      });

      this.handleLocationUpdate(position);
      this.flushLocationBuffer();
    } catch (error) {
      console.error('❌ Error forcing location update:', error);
    }
  }
}

// Create singleton instance
export const locationTrackingService = new LocationTrackingService();
export default locationTrackingService;