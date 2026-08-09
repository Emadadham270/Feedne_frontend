import { create } from 'zustand';
import { storyService } from '@/services/storyService';
import { getErrorMessage } from '@/services/api';

export const useStoryStore = create((set, get) => ({
  friendStories: [], // Grouped: [{ user, items: Story[] }]
  myStories: [],     // Story[]
  isLoading: false,
  isUploading: false,
  error: null,
  viewedStoryIds: new Set(JSON.parse(localStorage.getItem('viewedStories') || '[]')),

  markStoryViewed: (storyId) => {
    if (!storyId) return;
    set((state) => {
      const nextSet = new Set(state.viewedStoryIds);
      nextSet.add(storyId);
      try {
        localStorage.getItem('viewedStories') || '[]';
        localStorage.setItem('viewedStories', JSON.stringify(Array.from(nextSet)));
      } catch {}
      return { viewedStoryIds: nextSet };
    });
  },

  activeStoryGroup: null, // { user, items: Story[] } currently being viewed
  activeStoryIndex: 0,    // Current index in activeStoryGroup.items

  fetchStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const [rawFriends, rawMine] = await Promise.all([
        storyService.getStories().catch(() => []),
        storyService.getMyStories().catch(() => []),
      ]);

      // Group friend stories by user
      const map = new Map();
      for (const story of rawFriends) {
        const uid = story.user?.id;
        if (!uid) continue;
        if (!map.has(uid)) {
          map.set(uid, { user: story.user, items: [] });
        }
        map.get(uid).items.push(story);
      }

      set({
        friendStories: Array.from(map.values()),
        myStories: rawMine || [],
        isLoading: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  createStory: async (formData) => {
    set({ isUploading: true, error: null });
    try {
      const newStory = await storyService.createStory(formData);
      set((state) => ({
        myStories: [newStory, ...state.myStories],
        isUploading: false,
      }));
      await get().fetchStories();
      return newStory;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isUploading: false });
      throw new Error(msg);
    }
  },

  deleteStory: async (storyId) => {
    try {
      await storyService.deleteStory(storyId);
      set((state) => {
        const nextMine = state.myStories.filter((s) => s.id !== storyId);
        let nextGroup = state.activeStoryGroup;
        if (nextGroup) {
          const nextItems = nextGroup.items.filter((s) => s.id !== storyId);
          nextGroup = nextItems.length > 0 ? { ...nextGroup, items: nextItems } : null;
        }
        const nextIndex = Math.min(
          state.activeStoryIndex,
          (nextGroup?.items?.length ?? 1) - 1
        );
        return {
          myStories: nextMine,
          activeStoryGroup: nextGroup,
          activeStoryIndex: Math.max(0, nextIndex),
        };
      });
      get().fetchStories();
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  },

  openStoryViewer: (group, initialIndex = 0) => {
    set({ activeStoryGroup: group, activeStoryIndex: initialIndex });
  },

  closeStoryViewer: () => {
    set({ activeStoryGroup: null, activeStoryIndex: 0 });
  },

  nextStory: () => {
    const { activeStoryGroup, activeStoryIndex } = get();
    if (!activeStoryGroup) return;
    if (activeStoryIndex < activeStoryGroup.items.length - 1) {
      set({ activeStoryIndex: activeStoryIndex + 1 });
    } else {
      set({ activeStoryGroup: null, activeStoryIndex: 0 });
    }
  },

  prevStory: () => {
    const { activeStoryIndex } = get();
    if (activeStoryIndex > 0) {
      set({ activeStoryIndex: activeStoryIndex - 1 });
    }
  },
}));
