import { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, LayoutDashboard, Users } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminStatsCards } from './AdminStatsCards';
import { AdminChart } from './AdminChart';
import { AdminUsersTable } from './AdminUsersTable';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'overview', label: 'Overview',      icon: LayoutDashboard },
  { key: 'users',    label: 'User Management', icon: Users },
];

export function AdminPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersMeta, setUsersMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await adminService.getUsers({ page, limit: 15, search: search || undefined });
      setUsers(data.data);
      setUsersMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = (q) => {
    setSearch(q);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0f111a]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#13161F]/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-neutral-900 dark:text-white leading-none">Admin Panel</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Welcome back, <span className="font-semibold text-primary-500">{user?.displayName}</span></p>
            </div>
          </div>
          <button
            onClick={() => { loadStats(); loadUsers(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Cards — always visible */}
        <AdminStatsCards stats={stats} isLoading={statsLoading} />

        {tab === 'overview' && (
          <AdminChart stats={stats} />
        )}

        {tab === 'users' && (
          <AdminUsersTable
            users={users}
            isLoading={usersLoading}
            meta={usersMeta}
            search={search}
            onSearch={handleSearch}
            onPageChange={setPage}
            onRefresh={loadUsers}
          />
        )}
      </div>
    </div>
  );
}
