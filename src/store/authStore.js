import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG } from '@/constants/config';
import { authService } from '@/services/authService';
import { mapUser } from '@/lib/userMapper';
import { getErrorMessage } from '@/services/api';

/**
 * Global auth state — persisted to localStorage.
 *
 * After login/register the backend only returns { id, username, email }.
 * We immediately follow up with GET /api/users/me to get the full user
 * shape (profile, settings, counts) and map it via userMapper.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = await authService.login(credentials);
          localStorage.setItem(CONFIG.TOKEN_KEY, token);
          // Fetch the full user profile now that we have a token
          const rawUser = await authService.getMe();
          const user = mapUser(rawUser);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = await authService.register(data);
          localStorage.setItem(CONFIG.TOKEN_KEY, token);
          // Fetch full profile immediately after registration
          const rawUser = await authService.getMe();
          const user = mapUser(rawUser);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authService.logout();
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },

      /**
       * Refresh the current user from the API.
       * Call after updateProfile so sidebar/avatar update everywhere.
       */
      refreshUser: async () => {
        try {
          const rawUser = await authService.getMe();
          const user = mapUser(rawUser);
          set({ user });
        } catch {
          // Silently ignore — user is still authenticated
        }
      },

      /** Merge partial updates (e.g. bio change) into existing user */
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      clearError: () => set({ error: null }),
    }),
    {
      name: CONFIG.USER_KEY,
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
