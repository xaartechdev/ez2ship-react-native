import { Platform, PermissionsAndroid } from 'react-native';

// Add global navigator type
declare global {
  const navigator: any;
}

type SuccessCallback = (position: any) => void;
type ErrorCallback = (error: any) => void;

interface GeolocationOptions {
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

// Try to get the best available geolocation implementation
let GeolocationAPI: any = null;

function initializeGeolocation(): any {
  if (GeolocationAPI) {
    return GeolocationAPI;
  }

  // Try different geolocation sources in order of preference
  const attempts = [
    () => {
      // Try @react-native-community/geolocation
      try {
        const CommunityGeolocation = require('@react-native-community/geolocation').default;
        return CommunityGeolocation;
      } catch (e) {
        return null;
      }
    },
    () => {
      // Try React Native's built-in Geolocation
      try {
        const RN = require('react-native');
        if (RN.Geolocation) {
          console.log('✅ Found React Native built-in Geolocation');
          return RN.Geolocation;
        }
        return null;
      } catch (e) {
        console.log('⚠️ React Native Geolocation not available');
        return null;
      }
    },
    () => {
      // Try global navigator.geolocation
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        console.log('✅ Found navigator.geolocation');
        return navigator.geolocation;
      }
      console.log('⚠️ navigator.geolocation not available');
      return null;
    }
  ];

  for (const attempt of attempts) {
    try {
      const api = attempt();
      if (api) {
        GeolocationAPI = api;
        console.log('✅ Geolocation API initialized successfully');
        return GeolocationAPI;
      }
    } catch (error) {
      console.log('⚠️ Geolocation attempt failed:', error);
    }
  }

  console.error('❌ No geolocation API available');
  return null;
}

class BuiltInGeolocation {
  private watchId: number | null = null;

  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        
        console.log('📍 Android permissions result:', granted);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('❌ Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions handled differently
  }

  async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const fineLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        
        return fineLocation || coarseLocation;
      } catch (err) {
        console.error('❌ Permission check error:', err);
        return false;
      }
    }
    return true;
  }

  watchPosition(success: SuccessCallback, error?: ErrorCallback, options?: GeolocationOptions): number | null {
    console.log('🔍 Built-in Geolocation: Starting location watch...');
    console.log('📍 Options:', JSON.stringify(options, null, 2));
    
    // Get the best available geolocation API
    const geolocationAPI = initializeGeolocation();
    
    if (!geolocationAPI) {
      console.error('❌ No geolocation API available');
      if (error) {
        error({ code: 1, message: 'Geolocation not supported by this browser/device' });
      }
      return null;
    }

    console.log('✅ Geolocation API is available');

    try {
      const geoOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 60000, // Increased to 60 seconds for better GPS acquisition
        maximumAge: options?.maximumAge ?? 10000, // Allow slightly older cached locations
      };

      console.log('📍 Starting watchPosition with options:', geoOptions);

      this.watchId = geolocationAPI.watchPosition(
        (position: any) => {
          console.log('✅ Built-in geolocation success:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
          success(position);
        },
        (err: any) => {
          console.error('❌ Built-in geolocation error:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          
          // Provide detailed error explanations
          switch (err.code) {
            case 1:
              console.log('💡 Error 1: Permission denied - check device location permissions');
              break;
            case 2:
              console.log('💡 Error 2: Position unavailable - check GPS signal');
              break;
            case 3:
              console.log('💡 Error 3: Timeout - try increasing timeout or test outdoors');
              break;
            default:
              console.log('💡 Unknown error - try restarting the app');
          }
          
          if (error) error(err);
        },
        geoOptions
      );

      console.log('📍 WatchPosition started with ID:', this.watchId);
      return this.watchId;

    } catch (e) {
      console.error('❌ Exception starting watchPosition:', e);
      if (error) {
        error({ code: 1, message: `Exception: ${(e as Error).message}` });
      }
      return null;
    }
  }

  getCurrentPosition(success: SuccessCallback, error?: ErrorCallback, options?: GeolocationOptions): void {
    console.log('📍 Built-in Geolocation: Getting current position...');
    
    const geolocationAPI = initializeGeolocation();
    
    if (!geolocationAPI) {
      console.error('❌ No geolocation API available');
      if (error) {
        error({ code: 1, message: 'Geolocation not supported by this browser/device' });
      }
      return;
    }

    const geoOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 60000, // Increased to 60 seconds for better GPS acquisition
      maximumAge: options?.maximumAge ?? 10000, // Allow slightly older cached locations
    };

    console.log('📍 Getting position with options:', geoOptions);

    try {
      geolocationAPI.getCurrentPosition(
        (position: any) => {
          console.log('✅ Built-in getCurrentPosition success:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
          success(position);
        },
        (err: any) => {
          console.error('❌ Built-in getCurrentPosition error:', err);
          console.error('❌ Error details:', {
            code: err.code,
            message: err.message
          });
          
          if (error) error(err);
        },
        geoOptions
      );
    } catch (e) {
      console.error('❌ Exception in getCurrentPosition:', e);
      if (error) {
        error({ code: 1, message: `Exception: ${(e as Error).message}` });
      }
    }
  }

  clearWatch(watchId: number | null): void {
    console.log('🛑 Clearing watch ID:', watchId);
    
    const geolocationAPI = initializeGeolocation();
    
    if (watchId !== null && geolocationAPI) {
      try {
        geolocationAPI.clearWatch(watchId);
        console.log('✅ Watch cleared successfully');
      } catch (e) {
        console.error('❌ Error clearing watch:', e);
      }
    }
    
    this.watchId = null;
  }
}

const builtInGeolocation = new BuiltInGeolocation();

console.log('🌍 BUILT-IN GEOLOCATION MODULE INITIALIZED');
console.log('📱 Navigator.geolocation available:', !!navigator.geolocation);
console.log('📍 Platform:', Platform.OS);

export default {
  watchPosition: builtInGeolocation.watchPosition.bind(builtInGeolocation),
  getCurrentPosition: builtInGeolocation.getCurrentPosition.bind(builtInGeolocation),
  clearWatch: builtInGeolocation.clearWatch.bind(builtInGeolocation),
  requestLocationPermission: builtInGeolocation.requestLocationPermission.bind(builtInGeolocation),
  checkLocationPermission: builtInGeolocation.checkLocationPermission.bind(builtInGeolocation),
};