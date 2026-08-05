import { Bell, Mail, Moon, Sun, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/shared/SearchInput';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useChatStore } from '@/store/chatStore';
import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { getTotalUnread } = useChatStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const chatUnread = getTotalUnread();

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

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search creators, tags..."
        />
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
