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
    if (NativeGeo && typeof NativeGeo.watchPosition === 'function') {
      return NativeGeo.watchPosition(success, error, options);
    }

    if (hasNavigatorGeolocation) {
      try {
        // navigator returns watchId number
  return (globalThis as any).navigator.geolocation.watchPosition(success, error, options);
      } catch (e) {
        console.warn('geolocationSafe: navigator.geolocation.watchPosition failed', e);
        return null;
      }
    }

    console.warn('geolocationSafe: No geolocation implementation available (native module missing)');
    if (error) {
      error({ code: 1, message: 'Geolocation not available' });
    }
    return null;
  },

  getCurrentPosition(success: SuccessCallback, error?: ErrorCallback, options?: any): void {
    if (NativeGeo && typeof NativeGeo.getCurrentPosition === 'function') {
      return NativeGeo.getCurrentPosition(success, error, options);
    }

    if (hasNavigatorGeolocation) {
      try {
  return (globalThis as any).navigator.geolocation.getCurrentPosition(success, error, options);
      } catch (e) {
        console.warn('geolocationSafe: navigator.geolocation.getCurrentPosition failed', e);
        if (error) error(e);
        return;
      }
    }

    console.warn('geolocationSafe: No geolocation implementation available (native module missing)');
    if (error) error({ code: 1, message: 'Geolocation not available' });
  },

  clearWatch(watchId: number | null): void {
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
