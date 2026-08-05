import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI state — theme, modal, sidebar, active modal.
 * This is the right place for transient UI state shared across components.
 */
export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark'
      sidebarOpen: true,
      activeModal: null, // 'createPost' | 'comments' | null
      activeModalData: null,

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (name, data = null) => set({ activeModal: name, activeModalData: data }),

      closeModal: () => set({ activeModal: null, activeModalData: null }),
    }),
    {
      name: 'feedne_ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme class on app load
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
