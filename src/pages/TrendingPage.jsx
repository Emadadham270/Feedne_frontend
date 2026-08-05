import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { PostCard } from '@/features/feed/components/PostCard';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { usePostStore } from '@/store/postStore';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { UserCard } from '@/components/shared/UserCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Flame } from 'lucide-react';

export function TrendingPage() {
  const { trendingPosts, isLoadingTrending, fetchTrending } = usePostStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchTrending(true);
    userService.getUsers({ limit: 5 })
      .then((res) => setSuggestedUsers(mapUsers(res.data || [])))
      .catch(() => {});
  }, [fetchTrending]);

  const handleFollow = async (userId, shouldFollow) => {
    try {
      if (shouldFollow) {
        await userService.followUser(userId);
      } else {
        await userService.unfollowUser(userId);
      }
      setSuggestedUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: shouldFollow } : u))
      );
    } catch {}
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="flex gap-6 p-6 max-w-5xl mx-auto">
        {/* Trending feed */}
        <div className="flex-1 max-w-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={24} className="text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                Trending Feed
              </h1>
              <p className="text-xs text-neutral-400">
                Posts with the highest engagement relative to time published
              </p>
            </div>
          </div>

          {isLoadingTrending ? (
            Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
          ) : trendingPosts.length === 0 ? (
            <EmptyState
              title="Nothing trending yet"
              description="Posts with comments and reactions will appear here automatically."
            />
          ) : (
            trendingPosts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>

        {/* Right sidebar */}
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
