import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, Moon, Sun, Menu, Search, Users, MessageSquare, User, ArrowRight, Check, ChevronDown } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setIsPopoverOpen(false);
    navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
  };

  const handleSelectResult = (type, item) => {
    setIsPopoverOpen(false);
    setSearch('');
    if (type === 'user') {
      navigate(ROUTES.PROFILE_VIEW(item.username));
    } else if (type === 'group') {
      navigate(`/groups/${item.id}`);
    } else if (type === 'post') {
      navigate(`/explore`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#1A1D27]/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <span className="font-extrabold text-lg text-neutral-900 dark:text-white">
            Feed<span className="text-primary-500">ne</span>
          </span>
        </Link>
      </div>

      {/* Center: Live Search Bar with Popover */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => searchResults && setIsPopoverOpen(true)}
            placeholder="Search users, posts, groups..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
        </form>

        {/* Search Results Popover */}
        {isPopoverOpen && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1D27] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2">
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
                      <Avatar src={u.profile?.imgUrl} name={u.username} size="xs" isVerified={u.isVerified} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1">
                          <span>{u.username}</span>
                          {u.isVerified && (
                            <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex">
                              <Check size={8} strokeWidth={3.5} />
                            </span>
                          )}
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
                        {g.bio && (
                          <p className="text-[11px] text-neutral-400 truncate">{g.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View full search results footer */}
            <button
              onClick={handleSearchSubmit}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-primary-500 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View all results for &quot;{search}&quot;</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Right actions: Theme toggle, Notifications, Direct Messages, User avatar */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile Dropdown Toggle */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 flex items-center gap-1 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {user && <Avatar src={user.avatar} name={user.displayName} size="xs" isVerified={user.isVerified} />}
            <ChevronDown size={16} />
            {(unreadCount > 0 || chatUnread > 0) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white dark:border-[#1A1D27]" />
            )}
          </button>
          
          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1D27] rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 py-2 z-50 flex flex-col">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <Link to={ROUTES.NOTIFICATIONS} onClick={() => setShowMobileMenu(false)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-3"><Bell size={16} /><span>Notifications</span></div>
                {unreadCount > 0 && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              <Link to={ROUTES.MESSAGES} onClick={() => setShowMobileMenu(false)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-3"><Mail size={16} /><span>Messages</span></div>
                {chatUnread > 0 && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chatUnread}</span>}
              </Link>
              <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
              {user && (
                <Link to={ROUTES.PROFILE_VIEW(user.username)} onClick={() => setShowMobileMenu(false)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Desktop actions (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Dark mode toggle */}
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
              isVerified={user.isVerified}
              onClick={() => navigate(ROUTES.PROFILE_VIEW(user.username))}
              className="ml-1 cursor-pointer"
            />
          )}
        </div>
      </div>
    </header>
  );
}
