import { create } from 'zustand';
import { postService } from '@/services/postService';
import { mapPost, mapPosts } from '@/lib/postMapper';
import { CONFIG } from '@/constants/config';
import { getErrorMessage } from '@/services/api';
import { useGroupStore } from './groupStore';

/** Returns the current user ID from the persisted auth store. */
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem(CONFIG.USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

/**
 * Post store — manages feed, explore, trending, saved, and per-user posts.
 * Optimistic updates for like and bookmark to keep the UI snappy.
 */
export const usePostStore = create((set, get) => ({
  feedPosts:     [],
  explorePosts:  [],
  trendingPosts: [],
  savedPosts:    [],
  userPostsMap:  {}, // { [userId]: Post[] }

  isLoadingFeed:    false,
  isLoadingExplore: false,
  isLoadingTrending: false,
  isLoadingSaved:   false,

  hasMoreFeed:    true,
  hasMoreExplore: true,
  hasMoreTrending: true,

  feedPage:     1,
  explorePage:  1,
  trendingPage: 1,

  error: null,

  // ── Feed ───────────────────────────────────────────────────────────────────

  fetchFeed: async (reset = false) => {
    const page = reset ? 1 : get().feedPage;
    set({ isLoadingFeed: true, error: null });
    try {
      const currentUserId = getCurrentUserId();
      const { posts, hasMore } = await postService.getFeed({ page });
      const mapped = mapPosts(posts, currentUserId);
      set((state) => ({
        feedPosts:    reset ? mapped : [...state.feedPosts, ...mapped],
        hasMoreFeed:  hasMore,
        feedPage:     page + 1,
        isLoadingFeed: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err), isLoadingFeed: false });
    }
  },

  // ── Explore ────────────────────────────────────────────────────────────────

  fetchExplore: async (reset = false) => {
    const page = reset ? 1 : get().explorePage;
    set({ isLoadingExplore: true });
    try {
      const currentUserId = getCurrentUserId();
      const { posts, hasMore } = await postService.getExplore({ page });
      const mapped = mapPosts(posts, currentUserId);
      set((state) => ({
        explorePosts:  reset ? mapped : [...state.explorePosts, ...mapped],
        hasMoreExplore: hasMore,
        explorePage:   page + 1,
        isLoadingExplore: false,
      }));
    } catch {
      set({ isLoadingExplore: false });
    }
  },

  // ── Trending ───────────────────────────────────────────────────────────────

  fetchTrending: async (reset = false) => {
    const page = reset ? 1 : get().trendingPage;
    set({ isLoadingTrending: true });
    try {
      const currentUserId = getCurrentUserId();
      const { posts } = await postService.getTrendingPosts({ page, limit: 5 });
      const mapped = mapPosts(posts.slice(0, 5), currentUserId);
      set({
        trendingPosts:   mapped,
        hasMoreTrending: false,
        trendingPage:    page + 1,
        isLoadingTrending: false,
      });
    } catch {
      set({ isLoadingTrending: false });
    }
  },

  // ── Saved ──────────────────────────────────────────────────────────────────

  fetchSaved: async () => {
    set({ isLoadingSaved: true });
    try {
      const currentUserId = getCurrentUserId();
      const { posts } = await postService.getSavedPosts();
      set({ savedPosts: mapPosts(posts, currentUserId), isLoadingSaved: false });
    } catch {
      set({ isLoadingSaved: false });
    }
  },

  // ── User Posts ─────────────────────────────────────────────────────────────

  fetchUserPosts: async (userId, reset = false) => {
    try {
      const currentUserId = getCurrentUserId();
      const { posts } = await postService.getUserPosts(userId);
      const mapped = mapPosts(posts, currentUserId);
      set((state) => ({
        userPostsMap: { ...state.userPostsMap, [userId]: mapped },
      }));
    } catch {
      // silently fail — page will show empty state
    }
  },

  // ── Reaction Toggle (optimistic) ───────────────────────────────────────────

  toggleReaction: async (postId, type = 'LIKE') => {
    const currentUserId = getCurrentUserId();

    const findPost = (lists) => {
      for (const list of lists) {
        const p = list.find((p) => p.id === postId);
        if (p) return p;
      }
      return null;
    };

    const state = get();
    const groupState = useGroupStore.getState();
    const post = findPost([
      state.feedPosts,
      state.explorePosts,
      state.trendingPosts,
      state.savedPosts,
      groupState.activeGroupPosts,
    ]);

    const prevReactions = post?.reactions ?? [];
    const existingUserReaction = prevReactions.find((r) => r.userId === currentUserId);

    let newReactions = [];
    let isLiked = true;

    if (!type) {
      // Remove reaction
      newReactions = prevReactions.filter((r) => r.userId !== currentUserId);
      isLiked = false;
    } else if (existingUserReaction) {
      // Update reaction type
      newReactions = prevReactions.map((r) =>
        r.userId === currentUserId ? { ...r, type } : r
      );
    } else {
      // Add new reaction
      newReactions = [...prevReactions, { userId: currentUserId, type }];
    }

    const updateList = (posts) =>
      posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          isLiked,
          reactions: newReactions,
          _count: { ...p._count, reactions: newReactions.length },
        };
      });

    set((s) => ({
      feedPosts:     updateList(s.feedPosts),
      explorePosts:  updateList(s.explorePosts),
      trendingPosts: updateList(s.trendingPosts),
      savedPosts:    updateList(s.savedPosts),
    }));

    useGroupStore.setState((s) => ({
      activeGroupPosts: updateList(s.activeGroupPosts),
    }));

    try {
      if (!type) {
        await postService.unlikePost(postId);
      } else if (existingUserReaction) {
        await postService.changeReaction(postId, type);
      } else {
        await postService.likePost(postId, type);
      }
    } catch {
      // Revert on error
      set(() => ({
        feedPosts:     state.feedPosts,
        explorePosts:  state.explorePosts,
        trendingPosts: state.trendingPosts,
        savedPosts:    state.savedPosts,
      }));
      useGroupStore.setState(() => ({
        activeGroupPosts: groupState.activeGroupPosts,
      }));
    }
  },

  toggleLike: async (postId) => {
    const post = get().feedPosts.find((p) => p.id === postId) ||
                 get().trendingPosts.find((p) => p.id === postId);
    const userReaction = post?.reactions?.find((r) => r.userId === getCurrentUserId());
    if (userReaction) {
      await get().toggleReaction(postId, null);
    } else {
      await get().toggleReaction(postId, 'LIKE');
    }
  },

  // ── Bookmark Toggle (optimistic) ───────────────────────────────────────────

  toggleBookmark: async (postId) => {
    const findPost = (lists) => {
      for (const list of lists) {
        const p = list.find((p) => p.id === postId);
        if (p) return p;
      }
      return null;
    };

    const state = get();
    const post = findPost([state.feedPosts, state.explorePosts, state.trendingPosts]);
    const wasBookmarked = post?.isBookmarked ?? false;

    const updateList = (posts) =>
      posts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !wasBookmarked } : p
      );

    set((s) => ({
      feedPosts:     updateList(s.feedPosts),
      explorePosts:  updateList(s.explorePosts),
      trendingPosts: updateList(s.trendingPosts),
    }));

    try {
      if (wasBookmarked) {
        await postService.unbookmarkPost(postId);
      } else {
        await postService.bookmarkPost(postId);
      }
    } catch {
      // Revert
      const revert = (posts) =>
        posts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: wasBookmarked } : p
        );
      set((s) => ({
        feedPosts:     revert(s.feedPosts),
        explorePosts:  revert(s.explorePosts),
        trendingPosts: revert(s.trendingPosts),
      }));
    }
  },

  // ── Add / Remove from lists ────────────────────────────────────────────────

  addPost: (rawPost) => {
    const currentUserId = getCurrentUserId();
    const post = mapPost(rawPost, currentUserId);
    set((state) => ({ feedPosts: [post, ...state.feedPosts] }));
  },

  removePost: (postId) => {
    const removeFrom = (posts) => posts.filter((p) => p.id !== postId);
    set((s) => ({
      feedPosts:     removeFrom(s.feedPosts),
      explorePosts:  removeFrom(s.explorePosts),
      trendingPosts: removeFrom(s.trendingPosts),
      savedPosts:    removeFrom(s.savedPosts),
    }));
  },

  updatePostCaption: (postId, caption) => {
    const update = (posts) =>
      posts.map((p) => (p.id === postId ? { ...p, caption, content: caption } : p));
    set((s) => ({
      feedPosts:     update(s.feedPosts),
      explorePosts:  update(s.explorePosts),
      trendingPosts: update(s.trendingPosts),
    }));
  },
}));
