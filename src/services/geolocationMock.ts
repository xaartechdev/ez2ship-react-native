/**
 * Mock Geolocation Service for Testing
 * This service provides mock location data when real geolocation is not available
 * Use this only for development/testing purposes
 */

interface MockGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
  fastestInterval?: number;
  forceRequestLocation?: boolean;
  forceLocationManager?: boolean;
  showLocationDialog?: boolean;
  accuracy?: any;
}

interface MockLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

// Mock locations for testing (some locations in Delhi, India)
const MOCK_LOCATIONS: MockLocation[] = [
  {
    coords: {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  },
  {
    coords: {
      latitude: 28.6304,
      longitude: 77.2177,
      accuracy: 12,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  },
  {
    coords: {
      latitude: 28.6517,
      longitude: 77.2219,
      accuracy: 8,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }
];

class MockGeolocationService {
  private watchId: number = 0;
  private activeWatches: Map<number, ReturnType<typeof setInterval>> = new Map();
  private currentLocationIndex: number = 0;

  async requestLocationPermission(): Promise<boolean> {
    console.log('🎭 Mock Geolocation: Permission always granted');
    return true;
  }

  async checkLocationPermission(): Promise<boolean> {
    console.log('🎭 Mock Geolocation: Permission check always returns true');
    return true;
  }

  getCurrentPosition(
    success: (position: MockLocation) => void,
    error?: (error: any) => void,
    options?: MockGeolocationOptions
  ): void {
    console.log('🎭 Mock Geolocation: Getting current position...');
    
    // Simulate network delay
    setTimeout(() => {
      const location = this.getNextMockLocation();
      console.log('🎭 Mock location provided:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      success(location);
    }, 500);
  }

  watchPosition(
    success: (position: MockLocation) => void,
    error?: (error: any) => void,
    options?: MockGeolocationOptions
  ): number {
    this.watchId++;
    const currentWatchId = this.watchId;
    
    // Update location every 10 seconds
    const interval = setInterval(() => {
      const location = this.getNextMockLocation();
      console.log('🎭 Mock location update:', {
        watchId: currentWatchId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      success(location);
    }, 10000);
    
    this.activeWatches.set(currentWatchId, interval);
    
    // Send initial location immediately
    setTimeout(() => {
      const location = this.getNextMockLocation();
      success(location);
    }, 100);
    
    return currentWatchId;
  }

  clearWatch(watchId: number): void {
    console.log('🎭 Mock Geolocation: Clearing watch:', watchId);
    
    const interval = this.activeWatches.get(watchId);
    if (interval) {
      clearInterval(interval);
      this.activeWatches.delete(watchId);
      console.log('🎭 Mock watch cleared successfully');
    } else {
      console.log('⚠️ Mock watch not found:', watchId);
    }
  }

  clearAllWatches(): void {
    console.log('🎭 Mock Geolocation: Clearing ALL active watches...');
    console.log(`🔄 Found ${this.activeWatches.size} active mock watches`);
    
    this.activeWatches.forEach((interval, watchId) => {
      console.log('🗑️ Clearing mock watch:', watchId);
      clearInterval(interval);
    });
    
    this.activeWatches.clear();
    console.log('✅ All mock watches cleared');
  }

  private getNextMockLocation(): MockLocation {
    const location = MOCK_LOCATIONS[this.currentLocationIndex];
    this.currentLocationIndex = (this.currentLocationIndex + 1) % MOCK_LOCATIONS.length;
    
    // Add some randomness to make it more realistic
    const randomOffset = 0.001; // ~100 meters
    const lat = location.coords.latitude + (Math.random() - 0.5) * randomOffset;
    const lng = location.coords.longitude + (Math.random() - 0.5) * randomOffset;
    
    return {
      coords: {
        ...location.coords,
        latitude: lat,
        longitude: lng,
      },
      timestamp: Date.now(),
    };
  }

  // Additional methods to match the interface
  stopObserving(): void {
    console.log('🎭 Mock Geolocation: Stopping all observations...');
    this.activeWatches.forEach((interval, watchId) => {
      clearInterval(interval);
    });
    this.activeWatches.clear();
  }
}

const mockGeolocationService = new MockGeolocationService();

export default {
  getCurrentPosition: mockGeolocationService.getCurrentPosition.bind(mockGeolocationService),
  watchPosition: mockGeolocationService.watchPosition.bind(mockGeolocationService),
  clearWatch: mockGeolocationService.clearWatch.bind(mockGeolocationService),
  clearAllWatches: mockGeolocationService.clearAllWatches.bind(mockGeolocationService),
  stopObserving: mockGeolocationService.stopObserving.bind(mockGeolocationService),
  requestLocationPermission: mockGeolocationService.requestLocationPermission.bind(mockGeolocationService),
  checkLocationPermission: mockGeolocationService.checkLocationPermission.bind(mockGeolocationService),
};