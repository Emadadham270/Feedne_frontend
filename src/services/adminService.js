import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async blockUser(userId) {
    const res = await api.patch(`/admin/users/${userId}/block`);
    return res.data;
  },

  async unblockUser(userId) {
    const res = await api.patch(`/admin/users/${userId}/unblock`);
    return res.data;
  },

  async activateUser(userId) {
    const res = await api.patch(`/admin/users/${userId}/activate`);
    return res.data;
  },

  async makeAdmin(userId) {
    const res = await api.patch(`/admin/users/${userId}/make-admin`);
    return res.data;
  },

  async revokeAdmin(userId) {
    const res = await api.patch(`/admin/users/${userId}/revoke-admin`);
    return res.data;
  },
};
