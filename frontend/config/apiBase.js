import {Platform} from 'react-native';
import Config from 'react-native-config';

const DEV_ANDROID = 'http://10.0.2.2:8086';
const DEV_IOS = 'http://localhost:8086';

function trimBase(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }
  return url.replace(/\/$/, '');
}

/**
 * API origin for the Node backend. Release builds require API_BASE_URL in .env.production
 * (via react-native-config). Twilio and payment secrets stay on the server only.
 */
export function getApiBaseUrl() {
  const fromEnv = trimBase(Config.API_BASE_URL);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (fromEnv) {
      return fromEnv;
    }
    return Platform.OS === 'android' ? DEV_ANDROID : DEV_IOS;
  }

  if (!fromEnv) {
    throw new Error(
      'API_BASE_URL is not set. Define it in .env.production before a release build.',
    );
  }
  return fromEnv;
}
