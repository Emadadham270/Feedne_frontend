import { create } from 'zustand';
import { chatService } from '@/services/chatService';
import { CONFIG } from '@/constants/config';
import { useBlockStore } from './blockStore';

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
                  content: message.content || (message.mediaType === 'VOICE' ? '🎤 Voice message' : message.mediaType === 'IMAGE' ? '📷 Image message' : ''),
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
                isVerified: partner?.isVerified || false,
              },
              lastMessage: {
                id: message.id,
                content: message.content || (message.mediaType === 'VOICE' ? '🎤 Voice message' : message.mediaType === 'IMAGE' ? '📷 Image message' : ''),
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

      chatService.onReaction((updatedMessage) => {
        const currentUserId = getCurrentUserId();
        const otherId =
          updatedMessage.senderId === currentUserId ? updatedMessage.receiverId : updatedMessage.senderId;

        set((s) => {
          const existing = s.messages[otherId] || [];
          const updatedMessages = existing.map((m) =>
            m.id === updatedMessage.id ? { ...m, reactions: updatedMessage.reactions } : m
          );
          return {
            messages: { ...s.messages, [otherId]: updatedMessages },
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
    if (useBlockStore.getState().isBlocked(user.id)) {
      alert("You cannot message a user you have blocked.");
      return;
    }
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
          isVerified: user.isVerified || false,
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

  sendMessage: async (conversationId, text, file = null) => {
    if (useBlockStore.getState().isBlocked(conversationId)) {
      alert("You cannot send messages to a user you have blocked.");
      return;
    }
    const currentUserId = getCurrentUserId();
    set({ isSending: true });

    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId,
      senderId: currentUserId,
      receiverId: conversationId,
      text: text || '',
      content: text || '',
      mediaUrl: file ? URL.createObjectURL(file) : null,
      mediaType: file ? (file.type.startsWith('audio/') || file.type.includes('webm') ? 'VOICE' : 'IMAGE') : null,
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
      const msg = await chatService.sendMessage(conversationId, text, file);

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
                  content: msg.content || (msg.mediaType === 'VOICE' ? '🎤 Voice message' : msg.mediaType === 'IMAGE' ? '📷 Image message' : ''),
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
      const isUnverified =
        err?.response?.data?.code === 'VERIFICATION_REQUIRED' ||
        err?.response?.data?.message?.includes('verification required');

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).filter(
            (m) => m.id !== tempId
          ),
        },
        isSending: false,
      }));

      if (isUnverified) {
        import('@/store/uiStore').then(({ useUIStore }) => {
          useUIStore.getState().openModal('verificationRequired', {
            message: err.response?.data?.message || 'Account verification required to send direct messages.',
          });
        });
      }
      throw err;
    }
  },

  // ── React to Message ───────────────────────────────────────────────────────

  reactToMessage: async (messageId, conversationId, emoji) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    // Optimistic update
    set((state) => {
      const currentMsgs = state.messages[conversationId] || [];
      const updatedMsgs = currentMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const existingReactions = m.reactions || [];
        const otherReactions = existingReactions.filter((r) => r.userId !== currentUserId);
        const newReactions = [...otherReactions, { userId: currentUserId, emoji }];
        return { ...m, reactions: newReactions };
      });
      return { messages: { ...state.messages, [conversationId]: updatedMsgs } };
    });

    try {
      const updatedMsg = await chatService.reactToMessage(messageId, emoji);
      set((state) => {
        const currentMsgs = state.messages[conversationId] || [];
        const updatedMsgs = currentMsgs.map((m) => (m.id === messageId ? updatedMsg : m));
        return { messages: { ...state.messages, [conversationId]: updatedMsgs } };
      });
    } catch (err) {
      console.error('Failed to react to message:', err);
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
