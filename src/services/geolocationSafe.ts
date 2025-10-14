import { NativeModules, Platform } from 'react-native';

type SuccessCallback = (position: any) => void;
type ErrorCallback = (error: any) => void;

function loadNativeGeolocation() {
  try {
    // Lazy require to avoid executing native-event-emitter construction at module load
    // which can throw when native module isn't linked (causes `new NativeEventEmitter()` error).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Geolocation = require('react-native-geolocation-service');

    // Basic validation: make sure the module provides the expected functions
    if (Geolocation && typeof Geolocation.getCurrentPosition === 'function') {
      return Geolocation;
    }
  } catch (e) {
    // Ignored — we'll fall back below
  }

  return null;
}

const NativeGeo = loadNativeGeolocation();

const hasNavigatorGeolocation = typeof (globalThis as any).navigator !== 'undefined' && !!(globalThis as any).navigator.geolocation;

export default {
  watchPosition(success: SuccessCallback, error?: ErrorCallback, options?: any): number | null {
    console.log('🔍 Geolocation: Attempting to start location tracking...');
    
    // Try built-in navigator geolocation first (more reliable fallback)
    if (hasNavigatorGeolocation) {
      try {
        console.log('🌐 Using built-in navigator.geolocation');
        return (globalThis as any).navigator.geolocation.watchPosition(success, error, options);
      } catch (e) {
        console.warn('geolocationSafe: navigator.geolocation.watchPosition failed', e);
      }
    }

    // Fallback to native module
    if (NativeGeo && typeof NativeGeo.watchPosition === 'function') {
      console.log('📱 Using native react-native-geolocation-service');
      return NativeGeo.watchPosition(success, error, options);
    }

    console.warn('geolocationSafe: No geolocation implementation available (native module missing)');
    console.log('💡 SOLUTION: Try rebuilding the app or check GEOLOCATION_FIX_GUIDE.md');
    if (error) {
      error({ code: 1, message: 'Geolocation not available - check app permissions and rebuild' });
    }
    return null;
  },

  getCurrentPosition(success: SuccessCallback, error?: ErrorCallback, options?: any): void {
    console.log('📍 Geolocation: Getting current position...');
    
    // Try built-in navigator geolocation first (more reliable fallback)
    if (hasNavigatorGeolocation) {
      try {
        console.log('🌐 Using built-in navigator.geolocation for current position');
        (globalThis as any).navigator.geolocation.getCurrentPosition(success, error, options);
        return;
      } catch (e) {
        console.warn('geolocationSafe: navigator.geolocation.getCurrentPosition failed', e);
      }
    }

    // Fallback to native module
    if (NativeGeo && typeof NativeGeo.getCurrentPosition === 'function') {
      console.log('📱 Using native react-native-geolocation-service for current position');
      NativeGeo.getCurrentPosition(success, error, options);
      return;
    }

    console.warn('geolocationSafe: No geolocation implementation available');
    console.log('💡 SOLUTION: Try rebuilding the app or check GEOLOCATION_FIX_GUIDE.md');
    if (error) {
      error({ code: 1, message: 'Geolocation not available - check app permissions and rebuild' });
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
