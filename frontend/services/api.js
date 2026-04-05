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

/** Sync bearer token with session storage — use this instance only, not `axios.defaults`. */
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
  return status >= 500 || status === 408 || status === 429;
}

api.interceptors.response.use(
  response => response,
  async err => {
    const config = err.config;
    if (__DEV__ && err.response?.status === 401) {
      console.warn('API 401 — session may have expired');
    }
    if (!config || !isRetryableError(err)) {
      return Promise.reject(err);
    }
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(err);
    }
    config.__retryCount += 1;
    const delayMs = 500 * config.__retryCount;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return api(config);
  },
);

export default api;
