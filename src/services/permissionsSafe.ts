// Safe wrapper around react-native-permissions to avoid crashing when native module is missing
// Lazy-loads the real package and provides fallbacks for PERMISSIONS and RESULTS.

type PermissionStatus = 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited' | string;

const FALLBACK_RESULTS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
  LIMITED: 'limited',
};

const FALLBACK_PERMISSIONS = {
  ANDROID: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',
  },
  IOS: {
    LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
  },
};

import { NativeModules } from 'react-native';

function tryRequirePermissionsModule() {
  try {
    // If the native module is not registered in NativeModules, avoid requiring the package
    // because require('react-native-permissions') may call into TurboModuleRegistry and throw
    // when the native binary doesn't include RNPermissions.
    const nativePresent = !!(
      NativeModules && (NativeModules.RNPermissions || NativeModules.RNPermissionsModule)
    );

    if (!nativePresent) {
      return null;
    }

    // Lazy require now that we've confirmed a native registration exists
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const perms = require('react-native-permissions');
    return perms;
  } catch (e) {
    // Module not available or require caused native error; fall back
    const msg = (e && typeof e === 'object' && 'message' in e) ? (e as any).message : String(e);
    console.warn('permissionsSafe: require react-native-permissions failed:', msg);
    return null;
  }
}

export const PERMISSIONS = ((): any => {
  const m = tryRequirePermissionsModule();
  return (m && m.PERMISSIONS) ? m.PERMISSIONS : FALLBACK_PERMISSIONS;
})();

export const RESULTS = ((): any => {
  const m = tryRequirePermissionsModule();
  return (m && m.RESULTS) ? m.RESULTS : FALLBACK_RESULTS;
})();

export async function check(permission: string): Promise<PermissionStatus> {
  try {
    const m = tryRequirePermissionsModule();
    if (m && typeof m.check === 'function') {
      return await m.check(permission);
    }
  } catch (e) {
    console.warn('permissionsSafe.check failed:', e);
  }
  return FALLBACK_RESULTS.UNAVAILABLE;
}

export async function request(permission: string): Promise<PermissionStatus> {
  try {
    const m = tryRequirePermissionsModule();
    if (m && typeof m.request === 'function') {
      return await m.request(permission);
    }
  } catch (e) {
    console.warn('permissionsSafe.request failed:', e);
  }
  return FALLBACK_RESULTS.DENIED;
}

export async function requestMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>> {
  try {
    const m = tryRequirePermissionsModule();
    if (m && typeof m.requestMultiple === 'function') {
      return await m.requestMultiple(permissions);
    }
  } catch (e) {
    console.warn('permissionsSafe.requestMultiple failed:', e);
  }
  const result: Record<string, PermissionStatus> = {};
  for (const p of permissions) result[p] = FALLBACK_RESULTS.DENIED;
  return result;
}

export default {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  requestMultiple,
};
