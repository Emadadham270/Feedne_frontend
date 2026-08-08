import { useState, useRef } from 'react';
import { timeAgo } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Play, Pause, Smile, X } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export function MessageBubble({ message, isMine }) {
  const { activeConversationId, reactToMessage } = useChatStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const audioRef = useRef(null);

  const isImage = message.mediaType === 'IMAGE' || (message.mediaUrl && !message.mediaType?.includes('VOICE'));
  const isVoice = message.mediaType === 'VOICE';
  const reactions = message.reactions || [];

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setShowEmojiPicker(false);
    if (activeConversationId) {
      reactToMessage(message.id, activeConversationId, emoji);
    }
  };

  return (
    <div className={cn('group relative flex flex-col', isMine ? 'items-end' : 'items-start')}>
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className={cn(
          'absolute -top-10 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-neutral-900/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-700 shadow-xl animate-in fade-in-0 zoom-in-95',
          isMine ? 'right-0' : 'left-0'
        )}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiSelect(emoji)}
              className="text-base hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Message Container */}
      <div className="relative flex items-center gap-2 max-w-[85%] sm:max-w-[70%]">
        {/* Emoji reaction trigger button on hover */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={cn(
            'opacity-0 group-hover:opacity-100 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-opacity',
            isMine ? 'order-first' : 'order-last'
          )}
          title="React with emoji"
        >
          <Smile size={15} />
        </button>

        {/* Message Bubble Content */}
        <div
          className={cn(
            'relative rounded-2xl p-3 shadow-sm transition-all',
            isMine
              ? 'bg-primary-500 text-white rounded-br-xs'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-xs'
          )}
        >
          {/* Image Attachment */}
          {isImage && message.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-xl bg-black/10 cursor-pointer" onClick={() => setIsZoomOpen(true)}>
              <img
                src={message.mediaUrl}
                alt="Chat attachment"
                className="max-h-64 w-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Voice Note Player */}
          {isVoice && message.mediaUrl && (
            <div className="flex items-center gap-3 py-1 px-1 min-w-[200px]">
              <audio
                ref={audioRef}
                src={message.mediaUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
              <button
                onClick={handleToggleAudio}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 shadow-md',
                  isMine ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'
                )}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              {/* Sound Wave Visualization */}
              <div className="flex-1 flex items-center gap-1 h-6">
                {[40, 70, 30, 90, 50, 80, 40, 60, 100, 50, 80, 40].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${isPlaying ? Math.max(20, (h * Math.random()) + 20) : h}%` }}
                    className={cn(
                      'w-1 rounded-full transition-all duration-200',
                      isMine ? 'bg-white/80' : 'bg-primary-500/80'
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
          )}

          {/* Timestamp & Status */}
          <div
            className={cn(
              'text-[10px] mt-1 flex items-center justify-end gap-1',
              isMine ? 'text-white/70' : 'text-neutral-400'
            )}
          >
            <span>{timeAgo(message.createdAt)}</span>
            {isMine && message.status === 'sending' && (
              <span className="w-2 h-2 rounded-full border border-white border-t-transparent animate-spin inline-block" />
            )}
          </div>

          {/* Reaction Emoji Pill Badges */}
          {reactions.length > 0 && (
            <div className={cn(
              'absolute -bottom-3 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md text-xs',
              isMine ? 'right-2' : 'left-2'
            )}>
              {Array.from(new Set(reactions.map((r) => r.emoji))).map((emoji) => (
                <span key={emoji}>{emoji}</span>
              ))}
              {reactions.length > 1 && (
                <span className="text-[10px] font-bold text-neutral-500 ml-0.5">
                  {reactions.length}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Full Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setIsZoomOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
          <img src={message.mediaUrl} alt="Zoomed view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
