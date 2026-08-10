import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, TrendingUp, User, Settings, LogOut, PlusCircle, Flame, Check, Shield, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useGroupStore } from '@/store/groupStore';
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
  const { openModal, setSidebarOpen } = useUIStore();
  const { toggleWidget, myGroups } = useGroupStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setSidebarOpen(false);
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
          <Avatar src={user.avatar} name={user.displayName} size="md" hasStory={user.hasStory} isVerified={user.isVerified} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1">
              <span>{user.displayName}</span>
              {user.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex" title="Verified User">
                  <Check size={9} strokeWidth={3.5} />
                </span>
              )}
            </p>
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
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn('nav-link', isActive && 'active')}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Groups button in left sidebar */}
        <button
          onClick={() => {
            setSidebarOpen(false);
            toggleWidget();
          }}
          className="nav-link w-full text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary-500 group-hover:scale-110 transition-transform" />
            <span>Groups</span>
          </div>
          {myGroups.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center">
              {myGroups.length}
            </span>
          )}
        </button>

        {/* Admin Panel link — only visible to ADMIN role users */}
        {user?.role === 'ADMIN' && (
          <NavLink
            to={ROUTES.ADMIN}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn('nav-link', isActive && 'active')}
          >
            <Shield size={20} className="text-amber-500" />
            <span className="text-amber-500 font-semibold">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Create post CTA */}
      <div className="mt-4 mb-4">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center gap-2 font-bold shadow-lg shadow-primary-500/20"
          onClick={() => {
            setSidebarOpen(false);
            openModal('createPost');
          }}
        >
          <PlusCircle size={18} />
          <span>New Post</span>
        </Button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="nav-link text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
