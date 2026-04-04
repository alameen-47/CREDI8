import {Platform} from 'react-native';

const DEV_ANDROID = 'http://10.0.2.2:8086';
const DEV_IOS = 'http://localhost:8086';

/**
 * Production: your real API origin (HTTPS), same host as backend PUBLIC_API_BASE_URL.
 * Release builds use this constant; debug uses the emulator targets above.
 */
const PRODUCTION_API_BASE = 'https://api.yourdomain.com';

export function getApiBaseUrl() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return Platform.OS === 'android' ? DEV_ANDROID : DEV_IOS;
  }
  return PRODUCTION_API_BASE.replace(/\/$/, '');
}
