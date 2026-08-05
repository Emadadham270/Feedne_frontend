import { MOCK_NOTIFICATIONS } from '@/data/notifications';

export const notificationService = {
  async getNotifications() {
    // MOCK — replace with: return api.get('/notifications')
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_NOTIFICATIONS;
  },

  async markAsRead(notificationId) {
    // MOCK — replace with: return api.patch(`/notifications/${notificationId}/read`)
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  },

  async markAllAsRead() {
    // MOCK — replace with: return api.patch('/notifications/read-all')
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },

  async getUnreadCount() {
    // MOCK — replace with: return api.get('/notifications/unread-count')
    await new Promise((r) => setTimeout(r, 200));
    const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
    return { count: unread };
  },
};
