import { useState, useRef, useEffect } from 'react';
import { Send, Image, Phone, Video, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { EmptyState } from '@/components/shared/EmptyState';

export function ChatWindow({ conversation, onStartCall }) {
  const { messages, sendMessage, isSending } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const chatMessages = messages[conversation?.id] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!conversation) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Select a conversation"
        description="Choose someone to start messaging"
      />
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(conversation.id, text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Avatar src={conversation.participant.avatar} name={conversation.participant.displayName} size="md" isOnline />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white text-sm">
              {conversation.participant.displayName}
            </p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        {/* Voice & Video Call Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCall?.('voice')}
            className="p-2 rounded-xl text-neutral-600 hover:text-primary-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Start Voice Call"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="p-2 rounded-xl text-neutral-600 hover:text-primary-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Start Video Call"
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-neutral-100 dark:border-neutral-800">
        <button type="button" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <Image size={18} className="text-neutral-400" />
        </button>
        <input
          className="input-base flex-1"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="p-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <Send size={16} className="text-white" />
        </button>
      </form>
    </div>
  );
}
