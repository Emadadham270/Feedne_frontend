import api from './api';

/**
 * postService — all post-related API calls.
 *
 * Field name for file uploads: "media" (multer expects this name on the backend).
 * Reaction types: LIKE | LOVE | HAHA | SAD | ANGRY
 */
export const postService = {
  // ── Feed & Discovery ────────────────────────────────────────────────────────

  /** GET /api/posts/feed — posts from followed users */
  async getFeed({ page = 1, limit = 10 } = {}) {
    const response = await api.get('/posts/feed', { params: { page, limit } });
    return {
      posts:   response.data.data,
      hasMore: response.data.meta?.hasNextPage ?? false,
      total:   response.data.meta?.totalItems ?? 0,
    };
  },

  /** GET /api/posts — all public posts (explore) */
  async getExplore({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/posts', { params: { page, limit } });
    return {
      posts:   response.data.data,
      hasMore: response.data.meta?.hasNextPage ?? false,
    };
  },

  /** GET /api/posts/trending — trending posts (time-decay algorithm) */
  async getTrendingPosts({ page = 1, limit = 12 } = {}) {
    const response = await api.get('/posts/trending', { params: { page, limit } });
    return {
      posts:   response.data.data,
      hasMore: response.data.meta?.hasNextPage ?? false,
    };
  },

  /** GET /api/posts/saved — bookmarked posts */
  async getSavedPosts({ page = 1, limit = 12 } = {}) {
    const response = await api.get('/posts/saved', { params: { page, limit } });
    return {
      posts:   response.data.data,
      hasMore: response.data.meta?.hasNextPage ?? false,
    };
  },

  /** GET /api/posts/user/:userId — posts by a specific user */
  async getUserPosts(userId, { page = 1, limit = 12 } = {}) {
    const response = await api.get(`/posts/user/${userId}`, { params: { page, limit } });
    return {
      posts:   response.data.data,
      hasMore: response.data.meta?.hasNextPage ?? false,
    };
  },

  /** GET /api/posts/:id — single post */
  async getPostById(postId) {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // ── Create / Edit / Delete ──────────────────────────────────────────────────

  /**
   * POST /api/posts — create a new post.
   * @param {FormData} formData — fields: caption? (string), media? (File)
   * NOTE: multer expects the file field to be named "media"
   */
  async createPost(formData) {
    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * PUT /api/posts/:id — update caption only.
   * @param {string} postId
   * @param {string} caption
   */
  async editPost(postId, caption) {
    const response = await api.put(`/posts/${postId}`, { caption });
    return response.data;
  },

  /** DELETE /api/posts/:id */
  async deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // ── Share / Repost ──────────────────────────────────────────────────────────

  /**
   * POST /api/posts/:id/share — repost an existing post.
   * @param {string} postId
   * @param {string} [caption]
   */
  async sharePost(postId, caption) {
    const response = await api.post(`/posts/${postId}/share`, { caption });
    return response.data;
  },

  // ── Reactions ───────────────────────────────────────────────────────────────

  /**
   * POST /api/posts/:id/react — add a reaction.
   * @param {string} postId
   * @param {'LIKE'|'LOVE'|'HAHA'|'SAD'|'ANGRY'} type
   */
  async likePost(postId, type = 'LIKE') {
    const response = await api.post(`/posts/${postId}/react`, { type });
    return response.data;
  },

  /** DELETE /api/posts/:id/react — remove reaction */
  async unlikePost(postId) {
    const response = await api.delete(`/posts/${postId}/react`);
    return response.data;
  },

  /**
   * PATCH /api/posts/:id/react — change reaction type.
   * @param {string} postId
   * @param {'LIKE'|'LOVE'|'HAHA'|'SAD'|'ANGRY'} type
   */
  async changeReaction(postId, type) {
    const response = await api.patch(`/posts/${postId}/react`, { type });
    return response.data;
  },

  // ── Save / Bookmark ─────────────────────────────────────────────────────────

  /** POST /api/posts/:id/save */
  async bookmarkPost(postId) {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  },

  /** DELETE /api/posts/:id/save */
  async unbookmarkPost(postId) {
    const response = await api.delete(`/posts/${postId}/save`);
    return response.data;
  },

  // ── Comments ────────────────────────────────────────────────────────────────

  /**
   * GET /api/comments/:postId — top-level comments (no parentId)
   */
  async getComments(postId, { page = 1, limit = 20 } = {}) {
    const response = await api.get(`/comments/${postId}`, { params: { page, limit } });
    return response.data; // { data: Comment[], meta }
  },

  /**
   * POST /api/comments/:postId — create a top-level comment or reply.
   * @param {string} postId
   * @param {string} content
   * @param {string|null} [parentCommentId]
   */
  async addComment(postId, content, parentCommentId = null) {
    const body = { content };
    if (parentCommentId) body.parentCommentId = parentCommentId;
    const response = await api.post(`/comments/${postId}`, body);
    return response.data;
  },

  /**
   * GET /api/comments/:commentId/replies — replies for a comment
   */
  async getCommentReplies(commentId, { page = 1, limit = 10 } = {}) {
    const response = await api.get(`/comments/${commentId}/replies`, { params: { page, limit } });
    return response.data; // { data: Comment[], meta }
  },

  /**
   * PUT /api/comments/:commentId — edit own comment
   */
  async editComment(commentId, content) {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  /** DELETE /api/comments/:commentId */
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  /** POST /api/comments/:commentId/react */
  async reactToComment(commentId, type = 'LIKE') {
    const response = await api.post(`/comments/${commentId}/react`, { type });
    return response.data;
  },

  /** DELETE /api/comments/:commentId/react */
  async undoReactToComment(commentId) {
    const response = await api.delete(`/comments/${commentId}/react`);
    return response.data;
  },
};
