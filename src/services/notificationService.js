import api from './api';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data?.data || [];
  },

  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};
