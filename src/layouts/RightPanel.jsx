import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { UserCard } from '@/components/shared/UserCard';

const TRENDING_TOPICS = [
  { tag: '#AIRevolution', category: 'Technology', posts: '24.5k', trend: 'Trending' },
  { tag: 'New Album Drops', category: 'Music', posts: '12k', trend: 'Trending' },
  { tag: '#SundayVibes', category: 'Lifestyle', posts: '8.2k', trend: 'Trending' },
];

export function RightPanel() {
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    userService.getUsers({ limit: 5 })
      .then((res) => setSuggested(mapUsers(res.data || [])))
      .catch(() => {});
  }, []);

  const handleFollow = async (userId, shouldFollow) => {
    try {
      if (shouldFollow) {
        await userService.followUser(userId);
      } else {
        await userService.unfollowUser(userId);
      }
      // Update local state
      setSuggested((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowing: shouldFollow } : u
        )
      );
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:flex flex-col gap-4 py-6 px-2">
      {/* Trending topics */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Trending for you</h3>
        <div className="space-y-4">
          {TRENDING_TOPICS.map((t) => (
            <div key={t.tag} className="cursor-pointer group">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.category} · {t.trend}
              </p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
                {t.tag}
              </p>
              <p className="text-xs text-neutral-400">{t.posts} posts</p>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-primary-500 font-medium hover:underline">
          Show more
        </button>
      </div>

      {/* Who to follow */}
      {suggested.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Who to follow</h3>
          <div className="space-y-1">
            {suggested.map((user) => (
              <UserCard key={user.id} user={user} compact onFollow={handleFollow} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-neutral-400 dark:text-neutral-600 px-1 leading-relaxed">
        Terms of Service · Privacy Policy · Cookie Policy
        <br />© 2025 Feedne Inc.
      </p>
    </aside>
  );
}
