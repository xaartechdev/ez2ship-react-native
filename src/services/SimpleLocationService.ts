/**
 * Simple Location Service
 * Clean, minimal implementation for sending location to API with order tracking
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

class SimpleLocationService {
  private static instance: SimpleLocationService;
  private isTracking = false;
  private watchId: number | null = null;
  private activeOrderIds: Set<string> = new Set();
  private trackingIntervalId: any = null;
  private lastLocation: { latitude: number; longitude: number; timestamp: number } | null = null;
  private MIN_ACCURACY = 50; // Minimum accuracy in meters
  private MIN_DISTANCE = 5; // Minimum distance in meters to consider as movement

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
   * Get current location once with enhanced accuracy
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy?: number } | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          console.log(`📍 Raw GPS data: Lat ${location.latitude}, Lng ${location.longitude}, Accuracy: ${location.accuracy}m`);
          
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout
          maximumAge: 5000, // Reduced max age for fresher location
          distanceFilter: 0, // Get all location updates
        }
      );
    });
  }

  /**
   * Check if location is accurate enough and different from last location
   */
  private isLocationValid(newLocation: { latitude: number; longitude: number; accuracy?: number }): boolean {
    // Check accuracy
    if (newLocation.accuracy && newLocation.accuracy > this.MIN_ACCURACY) {
      console.log(`⚠️ Location accuracy too low: ${newLocation.accuracy}m (min: ${this.MIN_ACCURACY}m)`);
      return false;
    }

    // Check distance from last location
    if (this.lastLocation) {
      const distance = this.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
      );

      if (distance < this.MIN_DISTANCE) {
        console.log(`📍 Location change too small: ${distance}m (min: ${this.MIN_DISTANCE}m)`);
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Send location to API with order_id (supports multiple order IDs as comma-separated string)
   */
  async sendLocationToAPI(latitude: number, longitude: number, orderId?: string): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      
      // Determine order IDs to send
      let orderIdsToSend: string;
      if (orderId) {
        // If specific orderId provided, use it
        orderIdsToSend = orderId;
      } else if (this.activeOrderIds.size > 0) {
        // Use all active order IDs as comma-separated string
        orderIdsToSend = Array.from(this.activeOrderIds).join(',');
      } else {
        console.warn('⚠️ No order ID available for location tracking');
        return false;
      }

      // Update last location
      this.lastLocation = {
        latitude,
        longitude,
        timestamp: Date.now()
      };

      const payload = {
        order_id: orderIdsToSend, // Now supports comma-separated string
        latitude: parseFloat(latitude.toFixed(7)), // Round to ~1cm precision
        longitude: parseFloat(longitude.toFixed(7)),
      };
      
      console.log('📤 API Request Details:', {
        url: 'https://devez2ship.xaartech.com/api/driver/tracking/update-location',
        method: 'POST',
        payload,
        activeOrderIds: Array.from(this.activeOrderIds),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken.substring(0, 10)}...` : 'No token'
        }
      });

      const response = await fetch('https://devez2ship.xaartech.com/api/driver/tracking/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const success = response.ok;
      const responseData = await response.text();
      
      console.log('📥 API Response Details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        success,
        responseData: responseData ? (responseData.length > 200 ? responseData.substring(0, 200) + '...' : responseData) : 'No response data'
      });
      
      if (success) {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('✅ Location API Success:', jsonData);
        } catch (e) {
          console.log('✅ Location API Success (non-JSON response)');
        }
      } else {
        console.error('❌ Location API Failed:', {
          status: response.status,
          response: responseData
        });
      }
      
      return success;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }

  /**
   * Start location tracking for a specific order
   */
  async startTrackingForOrder(orderId: string): Promise<void> {
    if (this.activeOrderIds.has(orderId)) {
      console.log(`⚠️ Already tracking for order ${orderId}`);
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.error('❌ Location permission denied');
      return;
    }

    console.log(`🚀 Adding order ${orderId} to location tracking...`);
    this.activeOrderIds.add(orderId);
    
    // Start tracking if not already started
    if (!this.isTracking) {
      this.isTracking = true;

      // Send initial location for all active orders
      const initialLocation = await this.getCurrentLocation();
      if (initialLocation) {
        await this.sendLocationToAPI(initialLocation.latitude, initialLocation.longitude);
      }

      // Set up interval tracking (every 5 seconds)
      this.trackingIntervalId = setInterval(async () => {
        if (this.activeOrderIds.size === 0) {
          console.log('⚠️ No active orders, stopping tracking interval');
          this.stopTracking();
          return;
        }
        
        const location = await this.getCurrentLocation();
        if (location) {
          // Check if location is accurate and significantly different
          if (this.isLocationValid(location)) {
            console.log(`✅ Location passed validation, sending to API for ${this.activeOrderIds.size} active orders`);
            await this.sendLocationToAPI(location.latitude, location.longitude);
          } else {
            console.log(`⚠️ Location filtered out due to poor accuracy or minimal movement`);
          }
        }
      }, 5000);

      console.log('✅ Location tracking started with 5-second intervals');
    } else {
      // Just send initial location for new order if tracking already active
      const initialLocation = await this.getCurrentLocation();
      if (initialLocation) {
        await this.sendLocationToAPI(initialLocation.latitude, initialLocation.longitude);
      }
    }

    console.log(`✅ Order ${orderId} added to tracking. Active orders: [${Array.from(this.activeOrderIds).join(', ')}]`);
  }

  /**
   * Stop location tracking for a specific order
   */
  stopTrackingForOrder(orderId: string): void {
    if (!this.activeOrderIds.has(orderId)) {
      console.log(`⚠️ Order ${orderId} is not being tracked`);
      return;
    }

    console.log(`🛑 Removing order ${orderId} from location tracking...`);
    this.activeOrderIds.delete(orderId);
    
    console.log(`✅ Order ${orderId} removed from tracking. Remaining active orders: [${Array.from(this.activeOrderIds).join(', ')}]`);
    
    // Stop tracking completely if no active orders
    if (this.activeOrderIds.size === 0) {
      this.stopTracking();
    }
  }

  /**
   * Start continuous location tracking (legacy method)
   */
  async startTracking(): Promise<void> {
    if (this.activeOrderIds.size === 0) {
      console.warn('⚠️ No active order IDs set for tracking');
      return;
    }
    // Tracking will be managed by startTrackingForOrder method
  }

  /**
   * Stop location tracking for all orders
   */
  stopTracking(): void {
    if (!this.isTracking) {
      console.log('📍 Location tracking not active');
      return;
    }

    console.log(`🛑 Stopping location tracking for all orders: [${Array.from(this.activeOrderIds).join(', ')}]`);
    
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.trackingIntervalId !== null) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
    
    this.isTracking = false;
    this.activeOrderIds.clear();
    this.lastLocation = null;
    console.log('✅ Location tracking stopped for all orders');
  }

  /**
   * Add order ID to tracking (alias for startTrackingForOrder)
   */
  async addOrderToTracking(orderId: string): Promise<void> {
    await this.startTrackingForOrder(orderId);
  }

  /**
   * Remove order ID from tracking (alias for stopTrackingForOrder)
   */
  removeOrderFromTracking(orderId: string): void {
    this.stopTrackingForOrder(orderId);
  }

  /**
   * Get active order IDs
   */
  getActiveOrderIds(): string[] {
    return Array.from(this.activeOrderIds);
  }

  /**
   * Get tracking status with multiple orders
   */
  getTrackingStatus(): { isTracking: boolean; activeOrderIds: string[]; orderCount: number } {
    return {
      isTracking: this.isTracking,
      activeOrderIds: Array.from(this.activeOrderIds),
      orderCount: this.activeOrderIds.size
    };
  }

  /**
   * Check if specific order is being tracked
   */
  isOrderBeingTracked(orderId: string): boolean {
    return this.activeOrderIds.has(orderId);
  }

  /**
   * Adjust tracking precision settings
   */
  setTrackingPrecision(mode: 'high' | 'balanced' | 'low'): void {
    switch (mode) {
      case 'high':
        this.MIN_ACCURACY = 20; // 20 meters
        this.MIN_DISTANCE = 3;  // 3 meters
        console.log('🎯 High precision mode: MIN_ACCURACY=20m, MIN_DISTANCE=3m');
        break;
      case 'balanced':
        this.MIN_ACCURACY = 50; // 50 meters
        this.MIN_DISTANCE = 5;  // 5 meters
        console.log('⚖️ Balanced mode: MIN_ACCURACY=50m, MIN_DISTANCE=5m');
        break;
      case 'low':
        this.MIN_ACCURACY = 100; // 100 meters
        this.MIN_DISTANCE = 10;  // 10 meters
        console.log('🔋 Battery saving mode: MIN_ACCURACY=100m, MIN_DISTANCE=10m');
        break;
    }
  }

  /**
   * Test the service by getting location once and sending to API
   */
  async testService(orderId?: string): Promise<void> {
    console.log('🧪 Testing Simple Location Service...');
    
    const location = await this.getCurrentLocation();
    if (location) {
      console.log(`📍 Got location: ${location.latitude}, ${location.longitude}`);
      const testOrderId = orderId || (this.activeOrderIds.size > 0 ? Array.from(this.activeOrderIds)[0] : 'test-order');
      await this.sendLocationToAPI(location.latitude, location.longitude, testOrderId);
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