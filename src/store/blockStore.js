import { create } from 'zustand';
import { userService } from '@/services/userService';

export const useBlockStore = create((set, get) => ({
  blockedUserIds: [], // Array of user IDs blocked by current user
  isLoading: false,

  fetchBlockedUsers: async () => {
    set({ isLoading: true });
    try {
      const list = await userService.getBlockedUsers();
      // list can be Array of User objects { id, username, ... }
      const ids = Array.isArray(list) ? list.map((u) => u.id) : [];
      set({ blockedUserIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  blockUser: async (userId) => {
    try {
      await userService.blockUser(userId);
      set((state) => ({
        blockedUserIds: state.blockedUserIds.includes(userId)
          ? state.blockedUserIds
          : [...state.blockedUserIds, userId],
      }));
      return true;
    } catch (err) {
      console.error('Failed to block user:', err);
      throw err;
    }
  },

  unblockUser: async (userId) => {
    try {
      await userService.unblockUser(userId);
      set((state) => ({
        blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
      }));
      return true;
    } catch (err) {
      console.error('Failed to unblock user:', err);
      throw err;
    }
  },

  isBlocked: (userId) => {
    return get().blockedUserIds.includes(userId);
  },
}));
