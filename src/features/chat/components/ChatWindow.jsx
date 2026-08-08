import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Phone, Video, MessageCircle, Mic, Square, Trash2, X, Check } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { EmptyState } from '@/components/shared/EmptyState';

export function ChatWindow({ conversation, onStartCall }) {
  const { messages, sendMessage, isSending } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const {
    isRecording,
    formattedTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !selectedFile) return;
    try {
      await sendMessage(conversation.id, text.trim(), selectedFile);
      setText('');
      handleClearFile();
    } catch {
      // Handled by API interceptor
    }
  };

  const handleSendVoiceNote = async () => {
    const recorded = await stopRecording();
    if (recorded && recorded.audioFile) {
      try {
        await sendMessage(conversation.id, '', recorded.audioFile);
      } catch {
        // Handled by API interceptor
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1A1D27]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Avatar
            src={conversation.participant.avatar}
            name={conversation.participant.displayName}
            size="md"
            isOnline
            isVerified={conversation.participant.isVerified}
          />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-1">
              <span>{conversation.participant.displayName}</span>
              {conversation.participant.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified User">
                  <Check size={9} strokeWidth={3.5} />
                </span>
              )}
            </p>
            <p className="text-xs text-green-500 font-medium">Online</p>
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

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Image Preview Bar if selected */}
      {selectedFile && (
        <div className="px-4 pt-2 flex items-center gap-3">
          <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-900">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-bold">
                FILE
              </div>
            )}
            <button
              onClick={handleClearFile}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-xs text-neutral-500 font-medium truncate max-w-xs">{selectedFile.name}</p>
        </div>
      )}

      {/* Chat Input & Media Actions Bar */}
      <div className="p-3 sm:p-4 border-t border-neutral-100 dark:border-neutral-800">
        {isRecording ? (
          /* Live Voice Recording Controls */
          <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-mono font-bold">{formattedTime}</span>
              <span className="text-xs font-semibold opacity-90">Recording Voice Note...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Cancel Recording"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Send size={14} />
                <span>Send Voice</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Input Bar */
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Attach Image"
            >
              <ImageIcon size={20} />
            </button>

            {/* Microphone Voice Note Button */}
            <button
              type="button"
              onClick={startRecording}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Record Voice Note"
            >
              <Mic size={20} />
            </button>

            {/* Text Input */}
            <input
              className="input-base flex-1 rounded-2xl py-2.5 px-4 text-sm"
              placeholder="Write a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!text.trim() && !selectedFile) || isSending}
              className="p-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
