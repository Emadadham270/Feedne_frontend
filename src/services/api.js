import axios from 'axios';
import { CONFIG } from '@/constants/config';

/**
 * Axios instance with base URL and JWT interceptors.
 * All service files use this instance — only this file needs updating
 * when the base URL or auth mechanism changes.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 & 403 VERIFICATION_REQUIRED globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.USER_KEY);
      window.location.href = '/login';
    } else if (status === 403 && (data?.code === 'VERIFICATION_REQUIRED' || data?.message?.includes('verification required'))) {
      // Import store dynamically to avoid circular dependencies
      import('@/store/uiStore').then(({ useUIStore }) => {
        useUIStore.getState().openModal('verificationRequired', { message: data.message });
      });
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from an Axios error.
 * Backend always returns { message: string } on errors.
 */
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export default api;
