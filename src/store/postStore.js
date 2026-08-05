import { create } from 'zustand';
import { postService } from '@/services/postService';
import { mapPost, mapPosts } from '@/lib/postMapper';
import { CONFIG } from '@/constants/config';
import { getErrorMessage } from '@/services/api';

/** Returns the current user ID from the persisted auth store. */
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem(CONFIG.USER_KEY);
    return JSON.parse(raw)?.state?.user?.id ?? null;
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
      const { posts, hasMore } = await postService.getTrendingPosts({ page });
      const mapped = mapPosts(posts, currentUserId);
      set((state) => ({
        trendingPosts:   reset ? mapped : [...state.trendingPosts, ...mapped],
        hasMoreTrending: hasMore,
        trendingPage:    page + 1,
        isLoadingTrending: false,
      }));
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

  // ── Like Toggle (optimistic) ───────────────────────────────────────────────

  toggleLike: async (postId) => {
    const currentUserId = getCurrentUserId();

    // Read current liked state from any of the post lists
    const findPost = (lists) => {
      for (const list of lists) {
        const p = list.find((p) => p.id === postId);
        if (p) return p;
      }
      return null;
    };

    const state = get();
    const post = findPost([
      state.feedPosts,
      state.explorePosts,
      state.trendingPosts,
      state.savedPosts,
    ]);

    const wasLiked = post?.isLiked ?? false;
    const prevReactions = post?.reactions ?? [];

    // Build new reactions array optimistically
    const newReactions = wasLiked
      ? prevReactions.filter((r) => r.userId !== currentUserId)
      : [...prevReactions, { userId: currentUserId, type: 'LIKE' }];

    const updateList = (posts) =>
      posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          isLiked:   !wasLiked,
          reactions: newReactions,
          _count:    { ...p._count, reactions: newReactions.length },
        };
      });

    // Apply optimistic update across all lists
    set((s) => ({
      feedPosts:     updateList(s.feedPosts),
      explorePosts:  updateList(s.explorePosts),
      trendingPosts: updateList(s.trendingPosts),
      savedPosts:    updateList(s.savedPosts),
    }));

    try {
      if (wasLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId, 'LIKE');
      }
    } catch (err) {
      // Revert optimistic update on failure
      const revert = (posts) =>
        posts.map((p) => {
          if (p.id !== postId) return p;
          return { ...p, isLiked: wasLiked, reactions: prevReactions,
            _count: { ...p._count, reactions: prevReactions.length } };
        });
      set((s) => ({
        feedPosts:     revert(s.feedPosts),
        explorePosts:  revert(s.explorePosts),
        trendingPosts: revert(s.trendingPosts),
        savedPosts:    revert(s.savedPosts),
      }));
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
