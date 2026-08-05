import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { CategoryTabs } from '@/features/explore/components/CategoryTabs';
import { ExploreGrid } from '@/features/explore/components/ExploreGrid';
import { usePostStore } from '@/store/postStore';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { UserCard } from '@/components/shared/UserCard';

export function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('For You');
  const { explorePosts, isLoadingExplore, fetchExplore } = usePostStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchExplore(true);
  }, [activeCategory]);

  useEffect(() => {
    userService.getUsers({ limit: 5 })
      .then((res) => setSuggestedUsers(mapUsers(res.data || [])))
      .catch(() => {});
  }, []);

  const handleFollow = async (userId, shouldFollow) => {
    try {
      if (shouldFollow) {
        await userService.followUser(userId);
      } else {
        await userService.unfollowUser(userId);
      }
      setSuggestedUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, isFollowing: shouldFollow } : u)
      );
    } catch {}
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="flex gap-6 p-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          </div>
          <ExploreGrid posts={explorePosts} isLoading={isLoadingExplore} />
        </div>

        {/* Right sidebar (Explore-specific) */}
        {suggestedUsers.length > 0 && (
          <aside className="w-72 flex-shrink-0 hidden lg:block space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔥</span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Suggested Creators
                </h3>
              </div>
              <div className="space-y-2">
                {suggestedUsers.map((user) => (
                  <UserCard key={user.id} user={user} compact onFollow={handleFollow} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </MainLayout>
  );
}
