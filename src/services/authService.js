import api, { getErrorMessage } from './api';

/**
 * authService — handles login, register, and current-user fetch.
 * JWT tokens are stored in localStorage via CONFIG.TOKEN_KEY.
 */
export const authService = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user, token }>}
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { message, token, user: { id, username, email } }
  },

  /**
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ user, token }>}
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data; // { message, token, user: { id, username, email } }
  },

  async logout() {
    // Frontend-only logout — token is cleared by the store.
  },

  /**
   * Returns the full user object for the currently authenticated user.
   * Shape: { id, username, email, profile: { imgUrl, backImgUrl, bio }, settings, _count }
   */
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async sendOTP() {
    const response = await api.post('/auth/send-otp');
    return response.data;
  },

  async verifyOTP(code) {
    const response = await api.post('/auth/verify-otp', { code });
    return response.data;
  },
};
