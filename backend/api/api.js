import axios from 'axios';
import {getApiBaseUrl} from '../../frontend/config/apiBase.js';

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

let bearerToken = null;

/** Keep in sync with AsyncStorage session — all screens use this axios instance, not `axios.defaults`. */
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

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      console.warn('API 401 — session may have expired');
    }
    return Promise.reject(err);
  },
);

export default api;
