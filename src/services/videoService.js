import api from './api';

export const videoService = {
  /**
   * POST /api/video/room
   * @param {{ isOwner?: boolean, callType?: 'video' | 'voice', roomName?: string }} params
   */
  async createVideoRoom({ isOwner = true, callType = 'video', roomName } = {}) {
    const response = await api.post('/video/room', { isOwner, callType, roomName });
    return response.data; // { url, token, roomName, expiresAt, callType, isDemo }
  },
};
