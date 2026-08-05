import api from './api';

/**
 * storyService — all story-related API calls.
 *
 * Backend story shape:
 *   { id, mediaUrl, mediaPublicId, mediaType, caption, createdAt, expiresAt,
 *     userId, user: { id, username, profile: { imgUrl } } }
 */
export const storyService = {
  /**
   * GET /api/stories — non-expired stories from followed users.
   * Returns an array grouped by user for easy rendering.
   */
  async getStories() {
    const response = await api.get('/stories');
    return response.data; // Story[]
  },

  /** GET /api/stories/me — own active stories */
  async getMyStories() {
    const response = await api.get('/stories/me');
    return response.data; // Story[]
  },

  /** GET /api/stories/:storyId */
  async getStoryById(storyId) {
    const response = await api.get(`/stories/${storyId}`);
    return response.data;
  },

  /**
   * POST /api/stories — create a story.
   * @param {FormData} formData — required field: media (File); optional: caption (string)
   * NOTE: multer expects field named "media"
   */
  async createStory(formData) {
    const response = await api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** DELETE /api/stories/:storyId */
  async deleteStory(storyId) {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  },
};
