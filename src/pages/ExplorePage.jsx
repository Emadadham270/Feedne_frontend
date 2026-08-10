import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { CategoryTabs } from '@/features/explore/components/CategoryTabs';
import { ExploreGrid } from '@/features/explore/components/ExploreGrid';
import { PostCard } from '@/features/feed/components/PostCard';
import { UserCard } from '@/components/shared/UserCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { usePostStore } from '@/store/postStore';
import { useGroupStore } from '@/store/groupStore';
import { userService } from '@/services/userService';
import { mapUsers } from '@/lib/userMapper';
import { mapPosts } from '@/lib/postMapper';
import api from '@/services/api';
import { Search, Users, User, MessageSquare, Lock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function ExplorePage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('For You');
  const [searchTab, setSearchTab] = useState('all'); // 'all' | 'users' | 'groups' | 'posts'
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { explorePosts, isLoadingExplore, fetchExplore } = usePostStore();
  const { joinGroup } = useGroupStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  // Fetch search results if ?q=... is in URL
  useEffect(() => {
    if (!queryParam.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    api.get('/search', { params: { q: queryParam.trim(), type: searchTab } })
      .then((res) => {
        setSearchResults(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSearching(false));
  }, [queryParam, searchTab]);

  // Fetch default explore feed if no query
  useEffect(() => {
    if (!queryParam.trim()) {
      fetchExplore(true);
    }
  }, [activeCategory, queryParam]);

  useEffect(() => {
    userService.getRecommendedInterests(5)
      .then((data) => setSuggestedUsers(data || []))
      .catch(() => {
        userService.getUsers({ limit: 5 })
          .then((res) => setSuggestedUsers(mapUsers(res.data || [])))
          .catch(() => {});
      });
  }, []);

  const handleFollow = async (userId, shouldFollow) => {
    try {
      if (shouldFollow) {
        const res = await userService.followUser(userId);
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isFollowing: res.status === 'following', followStatus: res.status, isRequested: res.status === 'requested' }
              : u
          )
        );
      } else {
        await userService.unfollowUser(userId);
        setSuggestedUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, isFollowing: false, followStatus: 'none', isRequested: false } : u)
        );
      }
    } catch {}
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="flex gap-6 p-6 max-w-5xl mx-auto">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* SEARCH MODE */}
          {queryParam.trim() ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Search Results for "{queryParam}"
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Explore matching users, groups, and posts
                  </p>
                </div>
              </div>

              {/* Search Category Filter Tabs */}
              <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-4 text-xs font-semibold">
                <SearchTabBtn
                  active={searchTab === 'all'}
                  onClick={() => setSearchTab('all')}
                  label="All Results"
                />
                <SearchTabBtn
                  active={searchTab === 'users'}
                  onClick={() => setSearchTab('users')}
                  label="Users"
                  icon={User}
                />
                <SearchTabBtn
                  active={searchTab === 'groups'}
                  onClick={() => setSearchTab('groups')}
                  label="Groups"
                  icon={Users}
                />
                <SearchTabBtn
                  active={searchTab === 'posts'}
                  onClick={() => setSearchTab('posts')}
                  label="Posts"
                  icon={MessageSquare}
                />
              </div>

              {isSearching ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Users Section */}
                  {(searchTab === 'all' || searchTab === 'users') && searchResults?.users && searchResults.users.length > 0 && (
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={14} /> Users ({searchResults.users.length})
                      </h3>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {searchResults.users.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => navigate(ROUTES.PROFILE_VIEW(u.username))}
                            className="flex items-center justify-between py-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar src={u.profile?.imgUrl} name={u.username} size="md" />
                              <div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                  {u.username}
                                </p>
                                {u.profile?.bio && (
                                  <p className="text-xs text-neutral-400 max-w-md truncate">{u.profile.bio}</p>
                                )}
                              </div>
                            </div>
                            <Button variant="outlined" size="xs">View Profile</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groups Section */}
                  {(searchTab === 'all' || searchTab === 'groups') && searchResults?.groups && searchResults.groups.length > 0 && (
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} /> Groups ({searchResults.groups.length})
                      </h3>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {searchResults.groups.map((g) => (
                          <div
                            key={g.id}
                            onClick={() => navigate(ROUTES.GROUP_VIEW(g.id))}
                            className="flex items-center justify-between py-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar src={g.imgUrl} name={g.name} size="md" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                    {g.name}
                                  </p>
                                  {g.type === 'PRIVATE' && <Lock size={12} className="text-neutral-400" />}
                                </div>
                                <p className="text-xs text-neutral-400">{g._count?.members ?? 1} members</p>
                              </div>
                            </div>
                            <Button variant="primary" size="xs" onClick={(e) => { e.stopPropagation(); navigate(ROUTES.GROUP_VIEW(g.id)); }}>
                              Open Group
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts Section */}
                  {(searchTab === 'all' || searchTab === 'posts') && searchResults?.posts && searchResults.posts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <MessageSquare size={14} /> Posts ({searchResults.posts.length})
                      </h3>
                      {mapPosts(searchResults.posts).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {(!searchResults?.users?.length && !searchResults?.groups?.length && !searchResults?.posts?.length) && (
                    <div className="card p-12 text-center">
                      <Search size={36} className="mx-auto text-neutral-300 mb-2" />
                      <p className="text-sm text-neutral-400 font-medium">
                        No users, groups, or posts matching "{queryParam}".
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT EXPLORE MODE */
            <div>
              <div className="mb-5">
                <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
              </div>
              <ExploreGrid posts={explorePosts} isLoading={isLoadingExplore} />
            </div>
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

function SearchTabBtn({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
        active
          ? 'border-primary-500 text-primary-500 font-bold'
          : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
      }`}
    >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
    </button>
  );
}
