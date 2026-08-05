import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { storyService } from '@/services/storyService';
import { cn } from '@/lib/utils';

export function StoriesRow() {
  const { user }      = useAuthStore();
  const { openModal } = useUIStore();
  const [stories, setStories] = useState([]);  // grouped: [{ user, items: Story[] }]

  useEffect(() => {
    let cancelled = false;

    storyService.getStories()
      .then((raw) => {
        if (cancelled) return;
        // Group stories by user
        const map = new Map();
        for (const story of raw) {
          const uid = story.user?.id;
          if (!uid) continue;
          if (!map.has(uid)) {
            map.set(uid, { user: story.user, items: [] });
          }
          map.get(uid).items.push(story);
        }
        setStories(Array.from(map.values()));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex items-center gap-5 px-4 py-3 overflow-x-auto scrollbar-hide">
      {/* Your Story */}
      <button
        onClick={() => openModal('createStory')}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
      >
        <div className="relative">
          <Avatar
            src={user?.avatar}
            name={user?.displayName || user?.username}
            size="lg"
            className="ring-2 ring-dashed ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-[#1A1D27] group-hover:ring-primary-500 transition-colors"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1A1D27]">
            <PlusCircle size={12} className="text-white" />
          </span>
        </div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Your Story</span>
      </button>

      {/* Friends' stories */}
      {stories.map((group) => (
        <StoryCircle key={group.user.id} storyUser={group.user} />
      ))}
    </div>
  );
}

function StoryCircle({ storyUser }) {
  return (
    <button className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
      <Avatar
        src={storyUser.profile?.imgUrl}
        name={storyUser.username}
        size="lg"
        hasStory
        className="group-hover:scale-105 transition-transform duration-200"
      />
      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-[60px]">
        {storyUser.username}
      </span>
    </button>
  );
}
