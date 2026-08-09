import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useStoryStore } from '@/store/storyStore';
import { useAuthStore } from '@/store/authStore';
import { timeAgo } from '@/lib/dateUtils';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';

export function StoryViewerModal() {
  const { activeStoryGroup, activeStoryIndex, closeStoryViewer, nextStory, prevStory, deleteStory, markStoryViewed } = useStoryStore();
  const { user: currentUser } = useAuthStore();

  const currentStory = activeStoryGroup?.items?.[activeStoryIndex];

  // Mark current story as viewed
  useEffect(() => {
    if (currentStory?.id) {
      markStoryViewed(currentStory.id);
    }
  }, [currentStory?.id, markStoryViewed]);

  // Auto-advance images after 5s
  useEffect(() => {
    if (!currentStory || currentStory.mediaType === 'VIDEO') return;

    const timer = setTimeout(() => {
      nextStory();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStory, activeStoryIndex, nextStory]);

  if (!activeStoryGroup || !currentStory) return null;

  const author = activeStoryGroup.user;
  const isOwn = author?.id === currentUser?.id || currentStory.userId === currentUser?.id;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this story?')) {
      await deleteStory(currentStory.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in">
      {/* Container */}
      <div className="relative w-full max-w-md h-full max-h-[85vh] bg-neutral-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Progress bars header */}
        <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent space-y-2">
          <div className="flex gap-1.5">
            {activeStoryGroup.items.map((item, idx) => (
              <div key={item.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx < activeStoryIndex
                      ? 'w-full'
                      : idx === activeStoryIndex
                      ? 'w-full animate-pulse'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* User info & controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={author?.profile?.imgUrl || author?.avatar}
                name={author?.username}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-white">{author?.username}</p>
                <p className="text-[11px] text-white/70">{timeAgo(currentStory.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-full text-white/80 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Delete story"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={closeStoryViewer}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Media content */}
        <div className="relative flex-1 flex items-center justify-center bg-black">
          {currentStory.mediaType === 'VIDEO' || currentStory.mediaUrl.includes('/video/') ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              onEnded={nextStory}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}

          {/* Left / Right click zones */}
          <button
            onClick={prevStory}
            disabled={activeStoryIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextStory}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Caption overlay if present */}
        {currentStory.caption && (
          <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center">
            <p className="text-sm font-medium text-white break-words max-w-sm mx-auto">
              {currentStory.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
