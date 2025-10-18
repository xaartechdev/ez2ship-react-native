import { NativeModules, Platform } from 'react-native';

type SuccessCallback = (position: any) => void;
type ErrorCallback = (error: any) => void;

function loadNativeGeolocation() {
  try {
    console.log('🔍 Attempting to load react-native-geolocation-service...');
    // Lazy require to avoid executing native-event-emitter construction at module load
    // which can throw when native module isn't linked (causes `new NativeEventEmitter()` error).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Geolocation = require('react-native-geolocation-service');
    
    console.log('📦 Geolocation module loaded:', !!Geolocation);
    console.log('📦 getCurrentPosition available:', typeof Geolocation?.getCurrentPosition);
    console.log('📦 watchPosition available:', typeof Geolocation?.watchPosition);

    // Basic validation: make sure the module provides the expected functions
    if (Geolocation && typeof Geolocation.getCurrentPosition === 'function') {
      console.log('✅ Native geolocation module successfully loaded');
      return Geolocation;
    } else {
      console.warn('❌ Native geolocation module loaded but missing required functions');
    }
  } catch (e) {
    console.error('❌ Failed to load react-native-geolocation-service:', e instanceof Error ? e.message : String(e));
    console.log('💡 This usually means the native module is not properly linked');
    console.log('💡 Check GEOLOCATION_LINKING_FIX.md for solutions');
  }

  return null;
}

const NativeGeo = loadNativeGeolocation();

const hasNavigatorGeolocation = typeof (globalThis as any).navigator !== 'undefined' && !!(globalThis as any).navigator.geolocation;

// Log module availability at startup
console.log('🌍 GEOLOCATION MODULE INITIALIZATION:');
console.log('📱 Native module available:', !!NativeGeo);
console.log('🌐 Navigator geolocation available:', hasNavigatorGeolocation);
console.log('📍 Platform:', Platform.OS);

if (!NativeGeo && !hasNavigatorGeolocation) {
  console.error('🚨 CRITICAL: No geolocation implementation available!');
  console.log('💡 IMMEDIATE SOLUTIONS:');
  console.log('1. Rebuild the app: npx react-native run-android --reset-cache');
  console.log('2. Check linking: see GEOLOCATION_LINKING_FIX.md');
  console.log('3. Verify permissions in device settings');
}

export default {
  watchPosition(success: SuccessCallback, error?: ErrorCallback, options?: any): number | null {
    console.log('🔍 Geolocation: Attempting to start location tracking...');
    console.log('📍 Options:', JSON.stringify(options, null, 2));
    console.log('📍 Native module available:', !!NativeGeo);
    console.log('📍 Navigator geolocation available:', hasNavigatorGeolocation);
    
    // Critical diagnostic information
    if (!NativeGeo) {
      console.error('🚨 CRITICAL: react-native-geolocation-service not available!');
      console.log('🔧 REQUIRED ACTIONS:');
      console.log('1. Stop Metro: Ctrl+C');
      console.log('2. Clean build: cd android && ./gradlew clean && cd ..');
      console.log('3. Reset cache: npx react-native start --reset-cache');
      console.log('4. Rebuild: npx react-native run-android');
    }
    
    // Always try native module first for better device compatibility
    if (NativeGeo && typeof NativeGeo.watchPosition === 'function') {
      try {
        console.log('📱 Using native react-native-geolocation-service');
        const watchId = NativeGeo.watchPosition(
          (position: any) => {
            console.log('✅ Native geolocation success:', position);
            success(position);
          },
          (err: any) => {
            console.error('❌ Native geolocation error:', err);
            if (error) error(err);
          },
          options
        );
        console.log('📍 Native watchPosition started, ID:', watchId);
        return watchId;
      } catch (e) {
        console.error('❌ Native geolocation exception:', e);
      }
    }

    // Fallback to built-in navigator geolocation
    if (hasNavigatorGeolocation) {
      try {
        console.log('🌐 Fallback to built-in navigator.geolocation');
        return (globalThis as any).navigator.geolocation.watchPosition(
          (position: any) => {
            console.log('✅ Navigator geolocation success:', position);
            success(position);
          },
          (err: any) => {
            console.error('❌ Navigator geolocation error:', err);
            if (error) error(err);
          },
          options
        );
      } catch (e) {
        console.error('❌ Navigator geolocation exception:', e);
      }
    }

    console.error('❌ geolocationSafe: No geolocation implementation available');
    console.log('💡 DEVICE TROUBLESHOOTING:');
    console.log('1. Check if GPS is enabled in device settings');
    console.log('2. Grant location permissions to Ez2ship');
    console.log('3. Test outdoors for better GPS signal');
    console.log('4. Rebuild the app if native module is missing');
    
    if (error) {
      error({ code: 1, message: 'Geolocation not available - check app permissions and rebuild' });
    }
    return null;
  },

  getCurrentPosition(success: SuccessCallback, error?: ErrorCallback, options?: any): void {
    console.log('📍 Geolocation: Getting current position...');
    console.log('📍 Options:', JSON.stringify(options, null, 2));
    
    // Always try native module first for better device compatibility  
    if (NativeGeo && typeof NativeGeo.getCurrentPosition === 'function') {
      try {
        console.log('📱 Using native react-native-geolocation-service for current position');
        NativeGeo.getCurrentPosition(
          (position: any) => {
            console.log('✅ Native getCurrentPosition success:', position);
            success(position);
          },
          (err: any) => {
            console.error('❌ Native getCurrentPosition error:', err);
            console.log('🔄 Attempting fallback to navigator geolocation...');
            
            // Immediate fallback to navigator
            if (hasNavigatorGeolocation) {
              try {
                (globalThis as any).navigator.geolocation.getCurrentPosition(
                  (pos: any) => {
                    console.log('✅ Navigator fallback success:', pos);
                    success(pos);
                  },
                  (navErr: any) => {
                    console.error('❌ Navigator fallback also failed:', navErr);
                    if (error) error(err); // Report original native error
                  },
                  options
                );
              } catch (navE) {
                console.error('❌ Navigator fallback exception:', navE);
                if (error) error(err);
              }
            } else {
              if (error) error(err);
            }
          },
          options
        );
        return;
      } catch (e) {
        console.error('❌ Native getCurrentPosition exception:', e);
      }
    }

    // Direct fallback to built-in navigator geolocation
    if (hasNavigatorGeolocation) {
      try {
        console.log('🌐 Using built-in navigator.geolocation for current position');
        (globalThis as any).navigator.geolocation.getCurrentPosition(
          (position: any) => {
            console.log('✅ Navigator getCurrentPosition success:', position);
            success(position);
          },
          (err: any) => {
            console.error('❌ Navigator getCurrentPosition error:', err);
            if (error) error(err);
          },
          options
        );
        return;
      } catch (e) {
        console.error('❌ Navigator getCurrentPosition exception:', e);
      }
    }

    console.error('❌ geolocationSafe: No geolocation implementation available for getCurrentPosition');
    console.log('💡 DEVICE TROUBLESHOOTING:');
    console.log('1. Check if GPS is enabled in device settings');
    console.log('2. Grant location permissions to Ez2ship');
    console.log('3. Test outdoors for better GPS signal');
    console.log('4. Restart the app and try again');
    
    if (error) {
      error({ code: 1, message: 'Geolocation not available - check app permissions and GPS settings' });
    }
  },  clearWatch(watchId: number | null): void {
    if (NativeGeo && typeof NativeGeo.clearWatch === 'function') {
      try {
        if (watchId !== null) NativeGeo.clearWatch(watchId);
        return;
      } catch (e) {
        console.warn('geolocationSafe: Native clearWatch failed', e);
      }
    }

    if (hasNavigatorGeolocation) {
      try {
  if (watchId !== null) (globalThis as any).navigator.geolocation.clearWatch(watchId);
        return;
      } catch (e) {
        console.warn('geolocationSafe: navigator.clearWatch failed', e);
      }
    }

    // nothing to clear
  },
};
