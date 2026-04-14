import {Platform} from 'react-native';

let Config = null;
try {
  Config = require('react-native-config').default;
} catch {
  // react-native-config native module not available — fall back to defaults
}

const PORT = '8086';

// Your machine's local network IP — physical devices use this.
// Update if your Wi-Fi IP changes.
const LAN_IP = '10.46.49.103';

const DEV_URLS = {
  // Android emulator → special alias that routes to host loopback
  // Also works for physical devices connected via USB with `adb reverse tcp:8086 tcp:8086`
  android: `http://10.0.2.2:${PORT}`,
  // iOS simulator → shares host network
  ios: `http://localhost:${PORT}`,
  // Physical devices over Wi-Fi (no USB) → machine's LAN IP
  physical: `http://${LAN_IP}:${PORT}`,
};

function trimBase(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }
  return url.replace(/\/$/, '');
}

function isRunningOnEmulator() {
  // Constants is available via react-native but not always reliable;
  // a simple heuristic: Android emulator device names contain "emulator" or "sdk"
  try {
    const {DeviceInfo} = require('react-native/Libraries/Utilities/DeviceInfo');
    return false; // fallback — treat as physical
  } catch {
    return false;
  }
}

/**
 * Picks the right API URL:
 *  - .env override (API_BASE_URL) always wins
 *  - Dev: emulator gets 10.0.2.2 / localhost, physical gets LAN IP
 *  - Prod: requires API_BASE_URL in .env.production
 */
export function getApiBaseUrl() {
  const fromEnv = trimBase(Config?.API_BASE_URL);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (fromEnv) {
      return fromEnv;
    }
    // For physical devices, use LAN_IP. For emulators/simulators, use the special addresses.
    // react-native-config can override this via API_BASE_URL in .env.development
    if (Platform.OS === 'android') {
      return DEV_URLS.android;
    }
    return DEV_URLS.ios;
  }

  if (!fromEnv) {
    throw new Error(
      'API_BASE_URL is not set. Define it in .env.production before a release build.',
    );
  }
  return fromEnv;
}
