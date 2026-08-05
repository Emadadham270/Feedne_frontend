import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import { CONFIG } from '@/constants/config';

/** Returns the current user's ID from persisted auth store */
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem(CONFIG.USER_KEY);
    return JSON.parse(raw)?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

/**
 * Chat store — manages conversations list and per-conversation messages.
 * Socket.IO real-time message reception is set up in fetchConversations.
 */
export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {}, // { [conversationId]: Message[] }
  isLoading: false,
  isSending: false,
  typingUsers: {}, // { [conversationId]: boolean }

  // ── Conversations ──────────────────────────────────────────────────────────

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      chatService.connect();

      chatService.onMessage((message) => {
        const currentUserId = getCurrentUserId();
        const otherId =
          message.senderId === currentUserId ? message.receiverId : message.senderId;
        const isMine = message.senderId === currentUserId;

        set((s) => {
          const isActiveChat = s.activeConversationId === otherId;
          const existing = s.messages[otherId] || [];

          // 1. Message Deduplication & Replacement
          const isDuplicate = existing.some((m) => m.id === message.id);
          let updatedMessages = existing;

          if (!isDuplicate) {
            if (isMine) {
              const hasTemp = existing.some((m) => typeof m.id === 'string' && m.id.startsWith('temp_'));
              if (hasTemp) {
                let replaced = false;
                updatedMessages = existing.map((m) => {
                  if (!replaced && typeof m.id === 'string' && m.id.startsWith('temp_')) {
                    replaced = true;
                    return { ...message, status: 'sent' };
                  }
                  return m;
                });
              } else {
                updatedMessages = [...existing, { ...message, status: 'sent' }];
              }
            } else {
              updatedMessages = [...existing, { ...message, status: 'sent' }];
            }
          }

          // 2. Conversations List Update (last message & unread count)
          const existsConv = s.conversations.some((c) => c.id === otherId);
          let updatedConversations;

          if (existsConv) {
            updatedConversations = s.conversations.map((conv) => {
              if (conv.id !== otherId) return conv;
              const shouldIncrement = !isMine && !isActiveChat;
              return {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content || message.text,
                  createdAt: message.createdAt,
                  isMine,
                },
                unreadCount: shouldIncrement ? (conv.unreadCount || 0) + 1 : (isMine || isActiveChat ? 0 : conv.unreadCount || 0),
                updatedAt: message.createdAt,
              };
            });
          } else {
            const partner = isMine ? message.receiver : message.sender;
            const shouldUnread = !isMine && !isActiveChat;
            const newConv = {
              id: otherId,
              participant: {
                id: otherId,
                username: partner?.username || 'User',
                displayName: partner?.username || 'User',
                avatar: partner?.profile?.imgUrl || null,
              },
              lastMessage: {
                id: message.id,
                content: message.content || message.text,
                createdAt: message.createdAt,
                isMine,
              },
              unreadCount: shouldUnread ? 1 : 0,
              updatedAt: message.createdAt,
            };
            updatedConversations = [newConv, ...s.conversations];
          }

          updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          return {
            messages: { ...s.messages, [otherId]: updatedMessages },
            conversations: updatedConversations,
          };
        });
      });

      chatService.onTyping(({ userId }) => {
        set((s) => ({
          typingUsers: { ...s.typingUsers, [userId]: true },
        }));
        setTimeout(() => {
          set((s) => ({
            typingUsers: { ...s.typingUsers, [userId]: false },
          }));
        }, 3000);
      });

      const data = await chatService.getConversations();
      set({ conversations: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Active Conversation ────────────────────────────────────────────────────

  setActiveConversation: async (id) => {
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
    }));

    if (!get().messages[id]) {
      try {
        const msgs = await chatService.getMessages(id);
        set((state) => ({ messages: { ...state.messages, [id]: msgs } }));
      } catch {
        set((state) => ({ messages: { ...state.messages, [id]: [] } }));
      }
    }
  },

  startConversation: async (user) => {
    const convId = user.id;
    set((s) => {
      const exists = s.conversations.some((c) => c.id === convId);
      const updatedConvs = s.conversations.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      );

      if (exists) {
        return {
          conversations: updatedConvs,
          activeConversationId: convId,
        };
      }

      const newConv = {
        id: convId,
        participant: {
          id: user.id,
          username: user.username || user.handle || user.displayName,
          displayName: user.displayName || user.username,
          avatar: user.avatar || user.profile?.imgUrl || null,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };

      return {
        conversations: [newConv, ...s.conversations],
        activeConversationId: convId,
      };
    });

    if (!get().messages[convId]) {
      try {
        const msgs = await chatService.getMessages(convId);
        set((state) => ({ messages: { ...state.messages, [convId]: msgs } }));
      } catch {
        set((state) => ({ messages: { ...state.messages, [convId]: [] } }));
      }
    }
  },

  // ── Send Message ───────────────────────────────────────────────────────────

  sendMessage: async (conversationId, text) => {
    const currentUserId = getCurrentUserId();
    set({ isSending: true });

    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId,
      senderId: currentUserId,
      receiverId: conversationId,
      text,
      content: text,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), tempMsg],
      },
    }));

    try {
      const msg = await chatService.sendMessage(conversationId, text);

      set((state) => {
        const currentMsgs = state.messages[conversationId] || [];
        const filtered = currentMsgs.filter(
          (m) => m.id !== tempId && m.id !== msg.id
        );
        const updatedMsgs = [...filtered, { ...msg, status: 'sent' }];

        const updatedConvs = state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: {
                  id: msg.id,
                  content: msg.content || msg.text,
                  createdAt: msg.createdAt,
                  isMine: true,
                },
                unreadCount: 0,
                updatedAt: msg.createdAt,
              }
            : conv
        );

        updatedConvs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return {
          messages: { ...state.messages, [conversationId]: updatedMsgs },
          conversations: updatedConvs,
          isSending: false,
        };
      });
    } catch (err) {
      console.error('Send message failed:', err);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'failed' } : m
          ),
        },
        isSending: false,
      }));
    }
  },

  // ── Delete Message ─────────────────────────────────────────────────────────

  deleteMessage: async (messageId, conversationId) => {
    await chatService.deleteMessage(messageId);
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    }));
  },

  // ── Emit Typing ────────────────────────────────────────────────────────────

  emitTyping: (receiverId) => {
    chatService.emitTyping(receiverId);
  },

  getTotalUnread: () =>
    get().conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
}));
