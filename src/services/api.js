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

// Handle 401 globally — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.USER_KEY);
      window.location.href = '/login';
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
