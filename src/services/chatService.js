import api from './api';
import { socket } from '@/lib/socket';

/**
 * chatService — REST API + Socket.IO for messaging.
 *
 * Backend conversation list shape:
 *   { data: [{ user: { id, username, profile: { imgUrl } }, lastMessage: { id, content, createdAt, isMine } }], meta }
 *
 * Backend message shape:
 *   { id, content, createdAt, senderId, receiverId,
 *     sender: { id, username }, receiver: { id, username } }
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
      // Use the partner's user ID as the conversation ID for 1-on-1 chats
      id:          conv.user.id,
      participant: {
        id:          conv.user.id,
        username:    conv.user.username,
        displayName: conv.user.username,
        avatar:      conv.user.profile?.imgUrl ?? null,
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

  // ── Socket.IO ───────────────────────────────────────────────────────────────

  /**
   * Emit message:send and wait for the ack from the server.
   * Returns a normalised message object on success.
   */
  sendMessage(receiverId, content) {
    return new Promise((resolve, reject) => {
      socket.emit('message:send', { receiverId, content }, (response) => {
        if (response?.data) {
          resolve(mapMessage(response.data));
        } else {
          reject(new Error(response?.message || 'Failed to send message'));
        }
      });
    });
  },

  connect() {
    socket.connect();
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
  },

  offTyping() {
    socket.off('message:typing');
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
    status:    'sent',
    createdAt: raw.createdAt,
    sender:    raw.sender ?? null,
    receiver:  raw.receiver ?? null,
  };
}
