import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { SegmentedStoryRing } from '@/features/story/components/SegmentedStoryRing';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useStoryStore } from '@/store/storyStore';

export function StoriesRow() {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();
  const { friendStories, myStories, fetchStories, openStoryViewer } = useStoryStore();

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const hasOwnStory = myStories.length > 0;

  const handleOwnStoryClick = () => {
    if (hasOwnStory) {
      openStoryViewer({
        user: {
          id: user?.id,
          username: user?.displayName || user?.username || 'Your Story',
          profile: { imgUrl: user?.avatar },
        },
        items: myStories,
      });
    } else {
      openModal('createStory');
    }
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    openModal('createStory');
  };

  return (
    <div className="flex items-center gap-5 px-4 py-3 overflow-x-auto scrollbar-hide">
      {/* Your Story */}
      <div
        className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
        onClick={handleOwnStoryClick}
      >
        <div className="relative">
          <SegmentedStoryRing stories={myStories} sizePx={56}>
            <Avatar
              src={user?.avatar}
              name={user?.displayName || user?.username}
              size="lg"
              className="group-hover:scale-105 transition-transform duration-200"
            />
          </SegmentedStoryRing>
          <button
            onClick={handlePlusClick}
            className="absolute -bottom-0.5 -right-0.5 z-20 w-6 h-6 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1A1D27] transition-colors"
            title="Create story"
          >
            <PlusCircle size={14} className="text-white" />
          </button>
        </div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Your Story</span>
      </div>

      {/* Friends' stories */}
      {friendStories.map((group) => (
        <StoryCircle
          key={group.user.id}
          group={group}
          onClick={() => openStoryViewer(group)}
        />
      ))}
    </div>
  );
}

function StoryCircle({ group, onClick }) {
  const storyUser = group.user;
  const items = group.items || [];

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
      <SegmentedStoryRing stories={items} sizePx={56}>
        <Avatar
          src={storyUser.profile?.imgUrl || storyUser.avatar}
          name={storyUser.username}
          size="lg"
          className="group-hover:scale-105 transition-transform duration-200"
        />
      </SegmentedStoryRing>
      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-[60px]">
        {storyUser.username}
      </span>
    </button>
  );
}
