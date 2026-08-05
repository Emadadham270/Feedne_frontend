import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, Moon, Sun, Menu, Search, Users, MessageSquare, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useChatStore } from '@/store/chatStore';
import { ROUTES } from '@/constants/routes';
import api from '@/services/api';

export function Topbar() {
  const { user } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar, openModal } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { getTotalUnread } = useChatStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchRef = useRef(null);

  const chatUnread = getTotalUnread();

  // Debounced Live Search
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSearchResults(null);
      setIsPopoverOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/search', { params: { q: search.trim(), type: 'all' } });
        setSearchResults(res.data);
        setIsPopoverOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Click outside listener to close search popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      setIsPopoverOpen(false);
      navigate(`${ROUTES.EXPLORE}?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSelectResult = (type, item) => {
    setIsPopoverOpen(false);
    setSearch('');
    if (type === 'user') {
      navigate(ROUTES.PROFILE_VIEW(item.username));
    } else if (type === 'group') {
      navigate(ROUTES.GROUP_VIEW(item.id));
    } else if (type === 'post') {
      openModal('comments', { post: item });
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-6 h-16 bg-white dark:bg-[#13161F] border-b border-neutral-100 dark:border-neutral-800">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
      </button>

      {/* Logo (mobile only) */}
      <span className="lg:hidden text-xl font-extrabold text-primary-500">feedne</span>

      {/* Search Input & Live Popover */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchResults && setIsPopoverOpen(true)}
            placeholder="Search users, groups, posts..."
            className="w-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
          />
          {isSearching && (
            <div className="absolute right-3.5 w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Live Results Popover */}
        {isPopoverOpen && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1D27] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[460px] overflow-y-auto z-50 animate-in slide-in-from-top-2 duration-150">
            {/* Users section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  <User size={12} />
                  <span>Users</span>
                </div>
                <div className="space-y-1">
                  {searchResults.users.slice(0, 3).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectResult('user', u)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <Avatar src={u.profile?.imgUrl} name={u.username} size="xs" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {u.username}
                        </p>
                        {u.profile?.bio && (
                          <p className="text-[11px] text-neutral-400 truncate">{u.profile.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups section */}
            {searchResults.groups && searchResults.groups.length > 0 && (
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  <Users size={12} />
                  <span>Groups</span>
                </div>
                <div className="space-y-1">
                  {searchResults.groups.slice(0, 3).map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleSelectResult('group', g)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <Avatar src={g.imgUrl} name={g.name} size="xs" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {g.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">{g._count?.members ?? 1} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts section */}
            {searchResults.posts && searchResults.posts.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  <MessageSquare size={12} />
                  <span>Posts</span>
                </div>
                <div className="space-y-1">
                  {searchResults.posts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectResult('post', p)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <Avatar src={p.author?.profile?.imgUrl} name={p.author?.username} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {p.author?.username}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {p.caption || 'Media post'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* See all button */}
            <button
              onClick={() => {
                setIsPopoverOpen(false);
                navigate(`${ROUTES.EXPLORE}?q=${encodeURIComponent(search.trim())}`);
              }}
              className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1 border-t border-neutral-100 dark:border-neutral-800"
            >
              <span>See all results for "{search}"</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={20} className="text-yellow-400" />
            : <Moon size={20} className="text-neutral-500" />
          }
        </button>

        {/* Notifications */}
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Messages */}
        <Link
          to={ROUTES.MESSAGES}
          className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Mail size={20} className="text-neutral-600 dark:text-neutral-400" />
          {chatUnread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {chatUnread}
            </span>
          )}
        </Link>

        {/* User avatar */}
        {user && (
          <Avatar
            src={user.avatar}
            name={user.displayName}
            size="sm"
            onClick={() => navigate(ROUTES.PROFILE_VIEW(user.username))}
            className="ml-1 cursor-pointer"
          />
        )}
      </div>
    </header>
  );
}
