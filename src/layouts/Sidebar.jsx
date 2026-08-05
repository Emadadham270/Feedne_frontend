import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, TrendingUp, User, Settings, LogOut, PlusCircle, Flame } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: ROUTES.HOME },
  { icon: Compass, label: 'Explore', to: ROUTES.EXPLORE },
  { icon: TrendingUp, label: 'Trending', to: ROUTES.TRENDING },
  { icon: User, label: 'Profile', to: ROUTES.PROFILE_VIEW('me') },
  { icon: Settings, label: 'Settings', to: ROUTES.SETTINGS },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { openModal } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className="flex flex-col h-full w-64 px-4 py-6 bg-white dark:bg-[#13161F] border-r border-neutral-100 dark:border-neutral-800">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-2xl font-extrabold text-primary-500 tracking-tight">feedne</span>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 mb-8 px-2">
          <Avatar src={user.avatar} name={user.displayName} size="md" hasStory={user.hasStory} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{user.displayName}</p>
            <p className="text-xs text-neutral-400 truncate">{user.handle}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.HOME}
            className={({ isActive }) => cn('nav-link', isActive && 'active')}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Create Post Button */}
      <Button
        variant="primary"
        fullWidth
        className="mb-6 mt-4"
        onClick={() => openModal('createPost')}
      >
        <PlusCircle size={18} />
        Create Post
      </Button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-500 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
