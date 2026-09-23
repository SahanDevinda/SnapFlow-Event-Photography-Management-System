import axios from 'axios';

// Vite proxies /api -> http://localhost:8080 in dev; VITE_API_BASE_URL allows
// pointing the built bundle at a deployed backend.
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL
  // NOTE: no default Content-Type here. Setting 'application/json' globally
  // stops axios from generating the multipart boundary for FormData uploads.
});

// Request interceptor: attach Bearer token + correct content type per payload.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('snapflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
      // Let the browser set multipart/form-data; boundary=...
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    } else if (config.data !== undefined && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap payload and handle 401 globally.
api.interceptors.response.use(
  (response) => {
    // Binary downloads (blob/arraybuffer) are returned untouched.
    if (response.config?.responseType === 'blob' || response.config?.responseType === 'arraybuffer') {
      return { success: true, data: response.data, headers: response.headers };
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if (status === 401 && !['/login', '/register', '/'].includes(path)) {
      localStorage.removeItem('snapflow_token');
      localStorage.removeItem('snapflow_user');
      window.location.href = '/login?expired=true';
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    error.message = message;
    return Promise.reject(error);
  }
);

/**
 * Normalises a backend payload into a plain array.
 * Several endpoints return a Spring `Page` object ({ content, totalElements, ... })
 * while others return a bare list, so every list screen goes through this.
 */
export const listOf = (res) => {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

/** Loads an access-protected image and returns an object URL (revoke when done). */
export const fetchImageObjectUrl = async (url) => {
  const res = await api.get(url, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
};

export default api;
