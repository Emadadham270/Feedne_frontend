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
  messages:  {},   // { [conversationId]: Message[] }
  isLoading: false,
  isSending: false,
  typingUsers: {}, // { [conversationId]: boolean }

  // ── Conversations ──────────────────────────────────────────────────────────

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      // Connect socket and register incoming-message handler
      chatService.connect();

      chatService.onMessage((message) => {
        const currentUserId = getCurrentUserId();
        const otherId =
          message.senderId === currentUserId ? message.receiverId : message.senderId;

        set((s) => {
          // Update messages map
          const existing = s.messages[otherId] || [];
          // Avoid duplicates (e.g. sender sees their own message via socket AND optimistic)
          const isDuplicate = existing.some((m) => m.id === message.id);
          const updatedMessages = isDuplicate
            ? existing
            : [...existing, message];

          // Update last message in conversation list
          const updatedConversations = s.conversations.map((conv) =>
            conv.id === otherId
              ? {
                  ...conv,
                  lastMessage: {
                    id:        message.id,
                    content:   message.content,
                    createdAt: message.createdAt,
                    isMine:    message.senderId === currentUserId,
                  },
                  updatedAt: message.createdAt,
                }
              : conv
          );

          return {
            messages:      { ...s.messages, [otherId]: updatedMessages },
            conversations: updatedConversations,
          };
        });
      });

      chatService.onTyping(({ userId }) => {
        set((s) => ({
          typingUsers: { ...s.typingUsers, [userId]: true },
        }));
        // Clear typing indicator after 3 seconds
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
    set({ activeConversationId: id });
    if (!get().messages[id]) {
      try {
        const msgs = await chatService.getMessages(id);
        set((state) => ({ messages: { ...state.messages, [id]: msgs } }));
      } catch {
        set((state) => ({ messages: { ...state.messages, [id]: [] } }));
      }
    }
  },

  // ── Send Message ───────────────────────────────────────────────────────────

  sendMessage: async (conversationId, text) => {
    const currentUserId = getCurrentUserId();
    set({ isSending: true });

    // Optimistic: add a temp message immediately
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id:         tempId,
      senderId:   currentUserId,
      receiverId: conversationId,
      text,
      content:    text,
      status:     'sending',
      createdAt:  new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), tempMsg],
      },
    }));

    try {
      const msg = await chatService.sendMessage(conversationId, text);

      // Replace temp message with confirmed message
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map((m) =>
            m.id === tempId ? { ...msg, status: 'sent' } : m
          ),
        },
        isSending: false,
      }));
    } catch {
      // Mark temp message as failed
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
