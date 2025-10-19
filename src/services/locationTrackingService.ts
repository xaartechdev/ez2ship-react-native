/**
 * Location Tracking Service
 * Handles real-time location tracking for delivery orders
 * Automatically starts when order status changes to 'in_transit'
 */

import { Platform, AppState, Alert } from 'react-native';
// Use built-in geolocation for real GPS functionality
import Geolocation from './geolocationBuiltIn';

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

interface GeolocationError {
  code: number;
  message: string;
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
  private backgroundUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private locationBuffer: LocationData[] = [];
  private minDistanceForUpdate: number = 10; // meters
  private updateIntervalMs: number = 5000; // 5 seconds
  private backgroundUpdateIntervalMs: number = 30000; // 30 seconds for background
  private isInBackground: boolean = false;
  private gpsRetryCount: number = 0; // Counter for GPS retry attempts
  private maxGpsRetries: number = 3; // Maximum retries before giving up
  private isGpsWarming: boolean = false; // Flag to indicate GPS warming phase
  private gpsWarmupAttempts: number = 0; // Counter for GPS warmup attempts
  private maxGpsWarmupAttempts: number = 2; // Maximum warmup attempts

  constructor() {
    this.setupAppStateListener();
    this.checkBackgroundLocationCapabilities();
  }

  /**
   * Check if app has background location capabilities
   */
  private async checkBackgroundLocationCapabilities(): Promise<void> {
    // Minimal background capability check - removed excessive logging
  }

  /**
   * Setup app state listener to handle background/foreground transitions
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 App state changed to:', nextAppState);
      
      if (nextAppState === 'background') {
        this.isInBackground = true;
        if (this.isTracking) {
          console.log('🔄 App went to background, switching to background location tracking...');
          this.switchToBackgroundTracking();
        }
      } else if (nextAppState === 'active') {
        this.isInBackground = false;
        if (this.isTracking) {
          console.log('🔄 App came to foreground, switching to foreground location tracking...');
          this.switchToForegroundTracking();
          
          // Flush any buffered locations when returning to foreground
          if (this.locationBuffer.length > 0) {
            this.flushLocationBuffer();
          }
        }
      }
    });
  }

  /**
   * Ensure background tracking continues properly
   */
  private ensureBackgroundTracking(): void {
    if (!this.isTracking || !this.currentOrderId) {
      return;
    }

    if (this.watchId === null) {
      this.startLocationWatch();
    }

    if (this.isInBackground && this.backgroundUpdateInterval === null) {
      this.startBackgroundLocationTracking();
    } else if (!this.isInBackground && this.updateInterval === null) {
      this.startPeriodicUpdates();
    }
  }

  /**
   * Switch to background location tracking mode
   */
  private switchToBackgroundTracking(): void {
    console.log('🌙 Switching to background location tracking...');
    
    // Stop foreground tracking
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Start background tracking with longer intervals
    this.startBackgroundLocationTracking();
  }

  /**
   * Switch to foreground location tracking mode
   */
  private switchToForegroundTracking(): void {
    console.log('☀️ Switching to foreground location tracking...');
    
    // Stop background tracking
    if (this.backgroundUpdateInterval) {
      clearInterval(this.backgroundUpdateInterval);
      this.backgroundUpdateInterval = null;
    }

    // Resume normal foreground tracking
    this.startPeriodicUpdates();
  }

  /**
   * Start background location tracking with extended intervals
   */
  private startBackgroundLocationTracking(): void {
    if (this.backgroundUpdateInterval) {
      clearInterval(this.backgroundUpdateInterval);
    }

    console.log('🔄 Starting background location updates every 30 seconds...');
    
    this.backgroundUpdateInterval = setInterval(() => {
      if (this.isTracking && this.isInBackground) {
        console.log('🌙 Background location update check...');
        
        // Force a location update
        this.forceLocationUpdateInBackground();
        
        // Flush buffer if has locations
        if (this.locationBuffer.length > 0) {
          console.log(`🌙 Flushing ${this.locationBuffer.length} background locations...`);
          this.flushLocationBuffer();
        }
        
        // Check if tracking is still healthy
        if (this.watchId === null && this.currentOrderId) {
          console.log('🔄 Background: Restarting location watch...');
          this.startLocationWatch();
        }
      }
    }, this.backgroundUpdateIntervalMs);
  }

  /**
   * Force a location update specifically for background mode
   */
  private async forceLocationUpdateInBackground(): Promise<void> {
    if (!this.isTracking || !this.currentOrderId) {
      return;
    }

    try {
      console.log('🌙 Requesting background location...');
      
      const position = await new Promise<GeolocationResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Background location timeout'));
        }, 30000); // Increased background timeout to 30 seconds

        // Use real geolocation
        Geolocation.getCurrentPosition(
          (pos: GeolocationResponse) => {
            clearTimeout(timeout);
            resolve(pos);
          },
          (error: GeolocationError) => {
            clearTimeout(timeout);
            reject(error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 30000, // Increased background timeout
            maximumAge: 10000, // Allow slightly older locations in background
            // Background-friendly options
            forceRequestLocation: true,
            showLocationDialog: false // Don't show dialogs in background
          }
        );
      });

      console.log('✅ Background location obtained:', {
        lat: position.coords.latitude.toFixed(6),
        lng: position.coords.longitude.toFixed(6),
        accuracy: position.coords.accuracy
      });

      this.handleLocationUpdate(position);
      
    } catch (error) {
      console.error('❌ Background location error:', error);
      
      // Try with relaxed GPS settings as fallback
      console.log('🔄 Background GPS failed, trying relaxed settings...');
      
      // Try with network location as fallback
      try {
        const position = await new Promise<GeolocationResponse>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Background network location timeout'));
          }, 40000); // Increased network fallback timeout

          Geolocation.getCurrentPosition(
            (pos: GeolocationResponse) => {
              clearTimeout(timeout);
              resolve(pos);
            },
            (err: GeolocationError) => {
              clearTimeout(timeout);
              reject(err);
            },
            { 
              enableHighAccuracy: false, // Use network location
              timeout: 40000, // Longer timeout for network location
              maximumAge: 60000, // Accept older locations in background
              forceRequestLocation: true,
              showLocationDialog: false
            }
          );
        });

        console.log('✅ Background network location obtained:', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy
        });

        this.handleLocationUpdate(position);
        
      } catch (networkError) {
        console.error('❌ Background network location also failed:', networkError);
        console.error('📱 SOLUTION: Check GPS settings and try going outdoors');
      }
    }
  }

  /**
   * Request location permissions for Android and iOS
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const builtInGranted = await Geolocation.requestLocationPermission();
      if (builtInGranted) return true;

      if (Platform.OS === 'android') {
        try {
          const permissions = [
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          ];
          
          // For Android 10+ (API 29+), also request background location
          if (Platform.Version >= 29) {
            permissions.push(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
          }
          
          const results = await requestMultiple(permissions);
          const fineLocationGranted = results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED;
          const coarseLocationGranted = results[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;
          return fineLocationGranted || coarseLocationGranted;
        } catch {
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
   * Manual location test function for debugging on real devices
   */
  async testLocationAccess(): Promise<{success: boolean, message: string, data?: any}> {
    try {
      console.log('🧪 === MANUAL LOCATION TEST START ===');
      console.log('📱 Platform:', Platform.OS);
      console.log('📍 Geolocation module available:', !!Geolocation);
      
      // Step 1: Check permissions
      const hasPermissions = await this.hasLocationPermissions();
      console.log('🔐 Permissions check:', hasPermissions);
      
      if (!hasPermissions) {
        const granted = await this.requestLocationPermissions();
        console.log('🔐 Permission request result:', granted);
        if (!granted) {
          return {
            success: false,
            message: 'Location permissions not granted. Please check device settings.'
          };
        }
      }
      
      // Step 2: Test getCurrentPosition
      return new Promise((resolve) => {
        console.log('📍 Testing getCurrentPosition...');
        
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            message: 'Location test timed out after 45 seconds. Check GPS signal and try going outdoors.'
          });
        }, 45000); // Increased test timeout to 45 seconds
        
        Geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeout);
            console.log('✅ Location test SUCCESS:', position);
            resolve({
              success: true,
              message: 'Location access working perfectly!',
              data: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(position.timestamp).toLocaleString()
              }
            });
          },
          (error) => {
            clearTimeout(timeout);
            console.error('❌ Location test ERROR:', error);
            resolve({
              success: false,
              message: `Location error: ${error.message || error.code}`,
              data: error
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 45000, // Longer timeout for manual test
            maximumAge: 5000, // Fresh location for test
            forceRequestLocation: true,
            showLocationDialog: true
          }
        );
      });
    } catch (error) {
      console.error('❌ Location test exception:', error);
      return {
        success: false,
        message: `Test exception: ${(error as Error).message}`,
        data: error
      };
    }
  }

  /**
   * Start location watching
   */
  private startLocationWatch(): void {
    console.log('🔄 Starting real GPS location watch...');
    
    // Clear any existing GPS watch
    if (this.watchId !== null) {
      console.log('🔄 Clearing existing GPS watch ID:', this.watchId);
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Configure Geolocation options with realistic timeouts for device GPS
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: this.isInBackground ? 45000 : 30000, // 45s background, 30s foreground
      maximumAge: this.isInBackground ? 20000 : 10000, // Allow older locations in background
      distanceFilter: this.minDistanceForUpdate, // Update every 10 meters
      interval: this.isInBackground ? this.backgroundUpdateIntervalMs : 10000, // Longer intervals for background
      fastestInterval: 5000, // Fastest update every 5 seconds
      forceRequestLocation: true, // Force location request
      forceLocationManager: true, // Use LocationManager instead of FusedLocationProvider
      showLocationDialog: !this.isInBackground, // Don't show dialogs in background
      accuracy: {
        android: 'high',
        ios: 'best'
      }
    };

    console.log(`📍 Starting GPS location watch (${this.isInBackground ? 'background' : 'foreground'} mode)...`);

    // Use real GPS geolocation only
    this.watchId = Geolocation.watchPosition(
      (position: GeolocationResponse) => {
        console.log(`📍 REAL GPS LOCATION RECEIVED (${this.isInBackground ? 'BG' : 'FG'}) - ACTUAL DEVICE GPS:`, {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy
        });
        console.log('✅ This is your actual real-world location!');
        this.handleLocationUpdate(position);
      },
      (error) => {
        console.error('❌ Real GPS location watch error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Error code:', error.code, '| Message:', error.message);
        
        // Handle GPS errors with retry logic
        if (error.code === 1) {
          // Permission denied
          console.log('🚨 Location permission denied - check device settings');
          this.handleLocationError(error);
        } else if (error.code === 2) {
          // Position unavailable - retry with different settings
          console.log('🔄 GPS unavailable - retrying with relaxed settings...');
          setTimeout(() => {
            if (this.isTracking) {
              console.log('🔄 Retrying real GPS with relaxed settings...');
              this.retryRealGPS();
            }
          }, 5000);
        } else if (error.code === 3) {
          // Timeout - retry with relaxed settings
          console.log('⏰ GPS timeout - trying with relaxed settings...');
          setTimeout(() => {
            if (this.isTracking) {
              console.log('🔄 GPS timed out, trying relaxed settings...');
              this.retryRealGPS();
            }
          }, 2000);
        } else {
          // Other errors
          console.log('❌ GPS error - will retry...');
          this.handleLocationError(error);
        }
      },
      geoOptions
    );

    console.log('📍 Location watchPosition called, watchId:', this.watchId);
  }

  /**
   * Retry real GPS with more relaxed settings
   */
  private retryRealGPS(): void {
    if (!this.isTracking) {
      return;
    }

    this.gpsRetryCount++;
    console.log(`🔄 Retrying real GPS with relaxed settings (attempt ${this.gpsRetryCount}/${this.maxGpsRetries})...`);

    // If we've exceeded max retries, give up with helpful message
    if (this.gpsRetryCount >= this.maxGpsRetries) {
      console.log('🚨 GPS retry limit exceeded');
      console.log('📱 TROUBLESHOOTING REQUIRED:');
      console.log('   1. Enable GPS/Location Services in device settings');
      console.log('   2. Set location mode to "High accuracy" (GPS + Networks)');
      console.log('   3. Go outdoors for better satellite visibility');
      console.log('   4. Restart device if GPS seems stuck');
      console.log('   5. Try the location test function to debug further');
      return;
    }

    // Clear existing watch
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Progressively more relaxed GPS options based on retry count
    const relaxedOptions = {
      enableHighAccuracy: this.gpsRetryCount === 1, // First retry still tries high accuracy
      timeout: 40000 + (this.gpsRetryCount * 20000), // Increase timeout: 40s, 60s, 80s
      maximumAge: 30000 + (this.gpsRetryCount * 30000), // Allow progressively older locations
      distanceFilter: 0, // Accept any distance
      interval: 20000 + (this.gpsRetryCount * 10000), // Less frequent updates
      fastestInterval: 10000 + (this.gpsRetryCount * 5000),
      forceRequestLocation: true,
      forceLocationManager: this.gpsRetryCount === 1, // First retry uses LocationManager, then FusedLocationProvider
      showLocationDialog: true
    };

    console.log(`📍 GPS retry ${this.gpsRetryCount} settings:`, {
      enableHighAccuracy: relaxedOptions.enableHighAccuracy,
      timeout: relaxedOptions.timeout,
      maximumAge: relaxedOptions.maximumAge
    });

    this.watchId = Geolocation.watchPosition(
      (position: GeolocationResponse) => {
        console.log(`✅ GPS retry ${this.gpsRetryCount} successful - REAL LOCATION:`, {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy
        });
        console.log('🎉 GPS is working! Using real device location.');
        
        // Reset retry count on success
        this.gpsRetryCount = 0;
        this.handleLocationUpdate(position);
      },
      (error) => {
        console.error(`❌ GPS retry ${this.gpsRetryCount} failed:`, error);
        
        if (this.gpsRetryCount < this.maxGpsRetries) {
          console.log(`🔄 Will retry GPS again (${this.gpsRetryCount + 1}/${this.maxGpsRetries}) in 3 seconds...`);
          setTimeout(() => {
            if (this.isTracking) {
              this.retryRealGPS();
            }
          }, 3000);
        } else {
          console.log('🚨 All GPS retries exhausted');
          console.log('📱 Please check GPS settings and try again');
        }
      },
      relaxedOptions
    );
  }

  /**
   * Check if location permissions are granted
   */
  async hasLocationPermissions(): Promise<boolean> {
    try {
      const hasPermission = await Geolocation.checkLocationPermission();
      if (hasPermission) return true;

      if (Platform.OS === 'android') {
        try {
          const fineLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          const coarseLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
          
          const hasBasicLocation = fineLocationCheck === RESULTS.GRANTED || coarseLocationCheck === RESULTS.GRANTED;
          
          // For Android 10+, also check background location for better tracking
          if (Platform.Version >= 29 && hasBasicLocation) {
            try {
              const backgroundLocationCheck = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
              if (backgroundLocationCheck !== RESULTS.GRANTED) {
                console.log('⚠️ Background location permission not granted - background tracking may be limited');
              }
            } catch (e) {
              console.log('Background location permission check failed:', e);
            }
          }
          
          return hasBasicLocation;
        } catch {
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Warm up GPS by making initial location requests with progressive timeouts
   */
  private async warmUpGPS(): Promise<boolean> {
    if (this.isGpsWarming) {
      return false;
    }

    this.isGpsWarming = true;
    this.gpsWarmupAttempts = 0;
    
    console.log('🔥 Starting GPS warmup phase...');
    console.log('📡 This may take 30-90 seconds for initial GPS lock');
    console.log('💡 Please ensure GPS is enabled and try going outdoors for better signal');

    for (let attempt = 1; attempt <= this.maxGpsWarmupAttempts; attempt++) {
      this.gpsWarmupAttempts = attempt;
      
      const timeout = 30000 + (attempt * 30000); // 30s, 60s, 90s
      console.log(`🔥 GPS warmup attempt ${attempt}/${this.maxGpsWarmupAttempts} (timeout: ${timeout/1000}s)...`);

      try {
        const position = await new Promise<GeolocationResponse>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`GPS warmup timeout after ${timeout/1000} seconds`));
          }, timeout);

          Geolocation.getCurrentPosition(
            (pos: GeolocationResponse) => {
              clearTimeout(timeoutId);
              resolve(pos);
            },
            (error: GeolocationError) => {
              clearTimeout(timeoutId);
              reject(error);
            },
            { 
              enableHighAccuracy: attempt === 1, // First attempt uses high accuracy
              timeout: timeout,
              maximumAge: attempt === 1 ? 0 : 30000, // Fresh location for first attempt
              forceRequestLocation: true,
              showLocationDialog: true
            }
          );
        });

        console.log('✅ GPS warmup successful - GPS is ready!', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy,
          attempt: attempt
        });

        this.isGpsWarming = false;
        return true;

      } catch (error) {
        console.error(`❌ GPS warmup attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxGpsWarmupAttempts) {
          console.log('🚨 GPS warmup failed after all attempts');
          console.log('📱 TROUBLESHOOTING STEPS:');
          console.log('   1. Enable GPS/Location Services in device settings');
          console.log('   2. Set location mode to "High accuracy" (GPS + Networks)');
          console.log('   3. Go outdoors for better satellite visibility');
          console.log('   4. Wait 2-3 minutes for GPS to acquire satellites');
          console.log('   5. Restart device if GPS seems stuck');
          console.log('❌ Location tracking will not work without GPS access');
        } else {
          console.log(`🔄 Retrying GPS warmup in 5 seconds (attempt ${attempt + 1}/${this.maxGpsWarmupAttempts})...`);
          await new Promise<void>(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    this.isGpsWarming = false;
    return false;
  }

  /**
   * Start location tracking for a specific order
   */
  async startTracking(orderId: string): Promise<boolean> {
    try {
      console.log(`🚀 Starting location tracking for order: ${orderId}`);
      console.log('📱 Platform:', Platform.OS);
      console.log('📍 Device geolocation available:', !!Geolocation);

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
      this.gpsRetryCount = 0; // Reset retry count for fresh tracking

      // First, warm up GPS to ensure it's ready for tracking
      console.log('🔥 Warming up GPS before starting tracking...');
      const gpsReady = await this.warmUpGPS();
      
      if (!gpsReady) {
        console.log('❌ GPS warmup failed - cannot start location tracking');
        console.log('📱 Please fix GPS issues and try again');
        return false;
      } else {
        console.log('✅ GPS warmup successful - GPS is ready for tracking!');
        console.log('📍 Using REAL GPS for location tracking');
      }

      // Start watching position
      this.startLocationWatch();

      // Start appropriate tracking mode based on app state
      if (this.isInBackground) {
        this.startBackgroundLocationTracking();
      } else {
        this.startPeriodicUpdates();
      }

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

    if (this.backgroundUpdateInterval) {
      clearInterval(this.backgroundUpdateInterval);
      this.backgroundUpdateInterval = null;
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

    console.log('📍 REAL GPS New location:', {
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
  private handleLocationError(error: GeolocationError): void {
    console.error('❌ GPS error:', error);
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        console.error('❌ Location access denied');
        console.error('📱 SOLUTION: Go to Settings > Apps > Ez2ship > Permissions > Location > Allow');
        break;
      case 2: // POSITION_UNAVAILABLE
        console.error('⚠️ GPS temporarily unavailable - GPS may be disabled or no signal');
        console.error('📱 SOLUTION: Enable GPS and try going outdoors for better signal');
        break;
      case 3: // TIMEOUT
        console.error('⏰ GPS request timeout');
        console.error('📱 SOLUTION: Go outdoors, enable high accuracy GPS, or wait longer');
        break;
      default:
        console.error('⚠️ Unknown GPS error');
        console.error('📱 SOLUTION: Check GPS settings and restart app');
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
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      if (this.locationBuffer.length > 0) {
        this.flushLocationBuffer();
      }
      
      // Check if tracking is still healthy
      if (this.isTracking && this.watchId === null) {
        if (this.currentOrderId) {
          this.startTracking(this.currentOrderId);
        }
      }
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
   * TODO: Replace with Socket.IO implementation
   */
  private async sendLocationUpdate(locationData: LocationUpdateRequest): Promise<void> {
    try {
      console.log('📍 ==== LOCATION UPDATE (📍 REAL GPS LOCATION DATA) ====');
      console.log('📊 Order ID:', locationData.order_id);
      console.log('🗺️  Latitude:', locationData.latitude);
      console.log('🗺️  Longitude:', locationData.longitude);
      console.log('🎯 Accuracy:', locationData.accuracy + 'm');
      console.log('⏰ Timestamp:', locationData.timestamp);
      if (locationData.speed !== null) console.log('🚄 Speed:', locationData.speed + 'm/s');
      if (locationData.heading !== null) console.log('🧭 Heading:', locationData.heading + '°');
      if (locationData.altitude !== null) console.log('⛰️  Altitude:', locationData.altitude + 'm');
      console.log('✅ Location logged successfully (API disabled - ready for Socket.IO)');
      console.log('================================================');
      
      // TODO: Implement Socket.IO location broadcasting
      // Example socket implementation:
      // socketService.emit('driver-location-update', {
      //   order_id: locationData.order_id,
      //   coordinates: {
      //     lat: locationData.latitude,
      //     lng: locationData.longitude,
      //     accuracy: locationData.accuracy
      //   },
      //   timestamp: locationData.timestamp,
      //   metadata: {
      //     speed: locationData.speed,
      //     heading: locationData.heading,
      //     altitude: locationData.altitude
      //   }
      // });
      
      /* COMMENTED OUT - REST API IMPLEMENTATION
      console.log('🚀 Sending location update to: /driver/location-update');
      
      // Send location update to API using GET method with query parameters
      const queryParams = new URLSearchParams({
        order_id: locationData.order_id,
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        accuracy: locationData.accuracy.toString(),
        timestamp: locationData.timestamp,
        ...(locationData.speed !== null && { speed: locationData.speed.toString() }),
        ...(locationData.heading !== null && { heading: locationData.heading.toString() }),
        ...(locationData.altitude !== null && { altitude: locationData.altitude.toString() })
      });
      
      const response = await apiClient.get(`/driver/location-update?${queryParams.toString()}`);
      
      if (response.success) {
        console.log('✅ Location update sent successfully');
      } else {
        console.error('❌ Failed to send location update:', response.message);
        throw new Error(response.message);
      }
      */
      
    } catch (error) {
      console.error('❌ Error processing location update:', error);
      // Don't throw error to avoid stopping location tracking
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