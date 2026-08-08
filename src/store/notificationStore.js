import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';
import { playNotificationSound } from '@/lib/soundUtils';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  activeToasts: [],

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationService.getNotifications();
      const unread = data.filter((n) => !n.isRead).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
      activeToasts: state.activeToasts.filter((t) => t.id !== id),
    }));
    await notificationService.markAsRead(id);
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
      activeToasts: [],
    }));
    await notificationService.markAllAsRead();
  },

  // Called when a new real-time notification arrives via SSE
  addNotification: (notification) => {
    // Play chime sound
    playNotificationSound();

    // Add to notifications list, increment unread count, and push to activeToasts
    set((state) => {
      // Avoid duplicate toasts
      const isDuplicate = state.activeToasts.some((t) => t.id === notification.id);
      const newToasts = isDuplicate
        ? state.activeToasts
        : [notification, ...state.activeToasts].slice(0, 4); // Keep max 4 toasts at a time

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        activeToasts: newToasts,
      };
    });
  },

  removeToast: (id) => {
    set((state) => ({
      activeToasts: state.activeToasts.filter((t) => t.id !== id),
    }));
  },
}));
