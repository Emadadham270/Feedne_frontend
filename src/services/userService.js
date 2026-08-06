import api from './api';

/**
 * userService — all user-related API calls.
 * All endpoints require JWT (attached automatically by the api interceptor).
 */
export const userService = {
  // ── Current user ────────────────────────────────────────────────────────────

  /** GET /api/users/me — full profile including settings and counts */
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * PATCH /api/users/me/profile
   * @param {FormData} formData — may contain: bio (string), media (File)
   */
  async updateProfile(formData) {
    const response = await api.patch('/users/me/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * PATCH /api/users/me/settings
   * @param {{ isPrivateAccount?: boolean, isDarkMode?: boolean, notifications?: boolean }} fields
   */
  async updateSettings(fields) {
    const response = await api.patch('/users/me/settings', fields);
    return response.data;
  },

  // ── Users ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/users — paginated list of all users (excluding blocked/self).
   * Used for "Who to Follow" suggestions.
   */
  async getUsers({ page = 1, limit = 10 } = {}) {
    const response = await api.get('/users', { params: { page, limit } });
    return response.data; // { data: User[], meta }
  },

  /**
   * GET /api/users/:userId — profile for any user by ID.
   * Returns limited data if account is private and requester doesn't follow.
   */
  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * GET /api/users/search?q= — search users by username.
   */
  async searchUsers(q, { page = 1, limit = 10 } = {}) {
    const response = await api.get('/users/search', { params: { q, page, limit } });
    return response.data; // { data: User[], meta }
  },

  // ── Follow / Unfollow ───────────────────────────────────────────────────────

  /** POST /api/users/:userId/follow */
  async followUser(userId) {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  /** DELETE /api/users/:userId/follow */
  async unfollowUser(userId) {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // ── Followers / Following ───────────────────────────────────────────────────

  /** GET /api/users/:userId/followers */
  async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/users/${userId}/followers`, { params: { page, limit } });
    return response.data; // { data: User[], meta }
  },

  /** GET /api/users/:userId/following */
  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/users/${userId}/following`, { params: { page, limit } });
    return response.data; // { data: User[], meta }
  },

  // ── Block / Unblock ─────────────────────────────────────────────────────────

  /** POST /api/users/:userId/block */
  async blockUser(userId) {
    const response = await api.post(`/users/${userId}/block`);
    return response.data;
  },

  /** DELETE /api/users/:userId/block */
  async unblockUser(userId) {
    const response = await api.delete(`/users/${userId}/block`);
    return response.data;
  },

  /** GET /api/users/me/interests — algorithmically scored interest creator suggestions */
  async getRecommendedInterests(limit = 10) {
    const response = await api.get('/users/me/interests', { params: { limit } });
    return response.data; // Array of scored candidate users with reason badges
  },

  // ── Follow Requests ─────────────────────────────────────────────────────────

  /** GET /api/users/me/follow-requests */
  async getFollowRequests() {
    const response = await api.get('/users/me/follow-requests');
    return response.data;
  },

  /** POST /api/users/me/follow-requests/:requestId/accept */
  async acceptFollowRequest(requestId) {
    const response = await api.post(`/users/me/follow-requests/${requestId}/accept`);
    return response.data;
  },

  /** DELETE /api/users/me/follow-requests/:requestId/decline */
  async declineFollowRequest(requestId) {
    const response = await api.delete(`/users/me/follow-requests/${requestId}/decline`);
    return response.data;
  },
};
