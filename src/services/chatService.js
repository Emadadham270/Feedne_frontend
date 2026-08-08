import api from './api';
import { socket } from '@/lib/socket';
import { useUIStore } from '@/store/uiStore';

/**
 * chatService — REST API + Socket.IO for messaging.
 */
export const chatService = {
  // ── REST ────────────────────────────────────────────────────────────────────

  /**
   * GET /api/messages — conversation list (inbox).
   * Returns mapped conversation objects ready for the store/UI.
   */
  async getConversations() {
    const response = await api.get('/messages');
    const items = response.data.data || [];

    return items.map((conv) => ({
      id:          conv.user.id,
      participant: {
        id:          conv.user.id,
        username:    conv.user.username,
        displayName: conv.user.username,
        avatar:      conv.user.profile?.imgUrl ?? null,
        isVerified:  conv.user.isVerified ?? false,
      },
      lastMessage: conv.lastMessage,
      unreadCount: 0,
      updatedAt:   conv.lastMessage?.createdAt ?? new Date().toISOString(),
    }));
  },

  /**
   * GET /api/messages/:userId — messages with a specific user (chronological).
   */
  async getMessages(userId) {
    const response = await api.get(`/messages/${userId}`);
    const messages = response.data.data || [];
    return messages.map(mapMessage);
  },

  /**
   * DELETE /api/messages/:messageId
   */
  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * POST /api/messages/:receiverId — send message (text or file attachment) via REST API.
   */
  async sendMessage(receiverId, content, file) {
    if (file) {
      const formData = new FormData();
      if (content?.trim()) formData.append('content', content.trim());
      formData.append('media', file);
      const response = await api.post(`/messages/${receiverId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return mapMessage(response.data);
    } else {
      const response = await api.post(`/messages/${receiverId}`, { content: content?.trim() || '' });
      return mapMessage(response.data);
    }
  },

  /**
   * POST /api/messages/:messageId/react — react to message with emoji.
   */
  async reactToMessage(messageId, emoji) {
    socket.emit('message:react', { messageId, emoji });
    const response = await api.post(`/messages/${messageId}/react`, { emoji });
    return mapMessage(response.data);
  },

  connect() {
    socket.connect();
    // Listen for socket errors (e.g. unverified user error)
    socket.on('message:error', (data) => {
      if (data?.code === 'VERIFICATION_REQUIRED' || data?.message?.includes('verification required')) {
        useUIStore.getState().openModal('verificationRequired', { message: data.message });
      }
    });
  },

  disconnect() {
    socket.disconnect();
  },

  /**
   * Register handler for incoming messages.
   * @param {(msg: object) => void} callback
   */
  onMessage(callback) {
    socket.on('message:new', (raw) => callback(mapMessage(raw)));
  },

  /**
   * Register handler for message reactions.
   * @param {(msg: object) => void} callback
   */
  onReaction(callback) {
    socket.on('message:reaction', (raw) => callback(mapMessage(raw)));
  },

  /**
   * Register handler for typing indicators.
   * @param {(data: { userId: string }) => void} callback
   */
  onTyping(callback) {
    socket.on('message:typing', callback);
  },

  /** Emit typing indicator to the receiver */
  emitTyping(receiverId) {
    socket.emit('message:typing', receiverId);
  },

  offMessage() {
    socket.off('message:new');
    socket.off('message:reaction');
    socket.off('message:error');
  },

  offTyping() {
    socket.off('message:typing');
  },

  // ── Call Signaling Sockets ───────────────────────────────────────────────

  startCall(payload) {
    socket.emit('call:start', payload);
  },

  acceptCall(payload) {
    socket.emit('call:accept', payload);
  },

  declineCall(payload) {
    socket.emit('call:decline', payload);
  },

  endCall(payload) {
    socket.emit('call:end', payload);
  },

  onIncomingCall(callback) {
    socket.on('call:incoming', callback);
  },

  onCallAccepted(callback) {
    socket.on('call:accepted', callback);
  },

  onCallDeclined(callback) {
    socket.on('call:declined', callback);
  },

  onCallEnded(callback) {
    socket.on('call:ended', callback);
  },

  offCallEvents() {
    socket.off('call:incoming');
    socket.off('call:accepted');
    socket.off('call:declined');
    socket.off('call:ended');
  },
};

/**
 * Normalise a raw backend message (Prisma shape) into the frontend message shape.
 */
function mapMessage(raw) {
  return {
    id:        raw.id,
    senderId:  raw.senderId,
    receiverId: raw.receiverId,
    text:      raw.content,
    content:   raw.content,
    mediaUrl:  raw.mediaUrl ?? null,
    mediaType: raw.mediaType ?? null,
    reactions: raw.reactions ?? [],
    status:    'sent',
    createdAt: raw.createdAt,
    sender:    raw.sender ?? null,
    receiver:  raw.receiver ?? null,
  };
}
