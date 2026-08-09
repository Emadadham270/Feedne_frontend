import { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export const REACTION_TYPES = [
  { type: 'LIKE',  emoji: '👍', label: 'Like',  color: 'text-blue-500' },
  { type: 'LOVE',  emoji: '❤️', label: 'Love',  color: 'text-red-500' },
  { type: 'HAHA',  emoji: '😆', label: 'Haha',  color: 'text-yellow-500' },
  { type: 'SAD',   emoji: '😢', label: 'Sad',   color: 'text-yellow-600' },
  { type: 'ANGRY', emoji: '😡', label: 'Angry', color: 'text-orange-600' },
];

export function ReactionPicker({
  userReaction,
  reactions = [],
  count = 0,
  onReact,
  onRemove,
  size = 'md',
}) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef(null);
  const { openModal } = useUIStore();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeReactionObj = REACTION_TYPES.find((r) => r.type === userReaction?.toUpperCase());

  // Count by type & sort top reactions (Facebook style)
  const typeCounts = reactions.reduce((acc, r) => {
    const t = r.type?.toUpperCase() || 'LIKE';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sortedTopTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => REACTION_TYPES.find((r) => r.type === t))
    .filter(Boolean);

  const totalCount = count || reactions.length;

  const handleTriggerClick = () => {
    if (activeReactionObj) {
      onRemove?.();
    } else {
      onReact?.('LIKE');
    }
  };

  const handleSelectReaction = (type) => {
    setShowPicker(false);
    if (userReaction?.toUpperCase() === type) {
      onRemove?.();
    } else {
      onReact?.(type);
    }
  };

  const handleOpenReactors = (e) => {
    e.stopPropagation();
    if (totalCount > 0 && reactions.length > 0) {
      openModal('reactors', { reactions });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setShowPicker(true)}
    >
      {/* Popover Reaction Bar */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-1.5 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {REACTION_TYPES.map(({ type, emoji, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleSelectReaction(type)}
              title={label}
              className={cn(
                'w-8 h-8 flex items-center justify-center text-lg rounded-full hover:scale-125 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150',
                userReaction?.toUpperCase() === type && 'bg-primary-50 dark:bg-primary-950/50 scale-110'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main React Button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={cn(
          'flex items-center gap-1.5 text-xs font-semibold transition-colors rounded-lg py-1 px-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/60',
          activeReactionObj ? activeReactionObj.color : 'text-neutral-500 hover:text-red-500'
        )}
      >
        {activeReactionObj ? (
          <span className="text-base leading-none">{activeReactionObj.emoji}</span>
        ) : (
          <Heart size={size === 'sm' ? 14 : 18} />
        )}
      </button>

      {/* Facebook-style Sorted Emojis & Total Count (Clickable to open ReactorsModal) */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={handleOpenReactors}
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="See who reacted"
        >
          <span className="flex items-center -space-x-1.5">
            {sortedTopTypes.length > 0 ? (
              sortedTopTypes.map((t) => (
                <span
                  key={t.type}
                  className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[11px] leading-none shadow-sm ring-1 ring-white dark:ring-neutral-900"
                >
                  {t.emoji}
                </span>
              ))
            ) : (
              <span className="text-[11px]">👍</span>
            )}
          </span>
          <span>{totalCount}</span>
        </button>
      )}
    </div>
  );
}
