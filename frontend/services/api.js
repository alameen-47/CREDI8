import axios from 'axios';
import {getApiBaseUrl} from '../config/apiBase';

const DEFAULT_TIMEOUT_MS = 25000;
const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

let bearerToken = null;

/**
 * Registered by AuthProvider so the Axios interceptor can trigger a logout
 * without importing React context (avoids circular deps).
 */
let _onUnauthorized = null;
export function registerUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

export function setApiAuthToken(token) {
  bearerToken = token || null;
  if (bearerToken) {
    api.defaults.headers.common.Authorization = `Bearer ${bearerToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use(config => {
  if (bearerToken) {
    config.headers.Authorization = `Bearer ${bearerToken}`;
  }
  return config;
});

function isRetryableError(err) {
  if (!err.response) {
    return (
      err.code === 'ECONNABORTED' ||
      (err.message && err.message.includes('Network Error'))
    );
  }
  const status = err.response.status;
  // Do NOT retry 401 — those need immediate logout
  return status >= 500 || status === 408 || status === 429;
}

api.interceptors.response.use(
  response => response,
  async err => {
    const config = err.config;

    // ── 401: session expired / invalid token → force logout ──────────────────
    if (err.response?.status === 401) {
      if (_onUnauthorized) {
        _onUnauthorized();
      }
      return Promise.reject(err);
    }

    if (!config || !isRetryableError(err)) {
      return Promise.reject(err);
    }

    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(err);
    }
    config.__retryCount += 1;
    // Exponential back-off: 500 ms, 1000 ms
    const delayMs = 500 * config.__retryCount;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return api(config);
  },
);

export default api;
