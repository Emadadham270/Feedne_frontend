import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  Shield, ShieldOff, Ban, CheckCircle, Crown, CrownIcon,
  Search, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

const ACTION_MENU = [
  { key: 'activate',    label: 'Activate',       icon: CheckCircle, color: 'text-green-500',  fn: adminService.activateUser,  show: (u) => !u.isVerified },
  { key: 'block',       label: 'Block',           icon: Ban,         color: 'text-red-500',    fn: adminService.blockUser,     show: (u) => !u.isBlocked },
  { key: 'unblock',     label: 'Unblock',         icon: ShieldOff,   color: 'text-blue-400',   fn: adminService.unblockUser,   show: (u) => u.isBlocked },
  { key: 'make-admin',  label: 'Make Admin',      icon: Crown,       color: 'text-amber-500',  fn: adminService.makeAdmin,     show: (u) => u.role !== 'ADMIN' },
  { key: 'revoke-admin', label: 'Revoke Admin',   icon: CrownIcon,   color: 'text-orange-400', fn: adminService.revokeAdmin,   show: (u) => u.role === 'ADMIN' },
];

function RoleBadge({ role }) {
  return role === 'ADMIN' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
      <Crown size={9} /> ADMIN
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
      USER
    </span>
  );
}

function StatusBadge({ isVerified, isBlocked }) {
  if (isBlocked) return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Blocked</span>
  );
  if (isVerified) return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Verified</span>
  );
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">Unverified</span>
  );
}

export function AdminUsersTable({ users, isLoading, meta, search, onSearch, onPageChange, onRefresh }) {
  const [loadingAction, setLoadingAction] = useState(null); // { userId, key }

  const handleAction = async (userId, actionKey, fn) => {
    setLoadingAction({ userId, key: actionKey });
    try {
      await fn(userId);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base">User Management</h3>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50/80 dark:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Posts</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded-full animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 dark:text-neutral-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={cn('hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors', user.isBlocked && 'opacity-60')}>
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profile?.imgUrl} name={user.username} size="sm" isVerified={user.isVerified} />
                      <span className="font-medium text-neutral-900 dark:text-white">{user.username}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{user.email}</td>

                  {/* Role */}
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>

                  {/* Status */}
                  <td className="px-6 py-4"><StatusBadge isVerified={user.isVerified} isBlocked={user.isBlocked} /></td>

                  {/* Posts Count */}
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-mono">{user._count?.posts ?? 0}</td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {ACTION_MENU.filter((a) => a.show(user)).map(({ key, label, icon: Icon, color, fn }) => {
                        const isActionLoading = loadingAction?.userId === user.id && loadingAction?.key === key;
                        return (
                          <button
                            key={key}
                            onClick={() => handleAction(user.id, key, fn)}
                            disabled={!!loadingAction}
                            title={label}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50',
                              color
                            )}
                          >
                            {isActionLoading
                              ? <Loader2 size={12} className="animate-spin" />
                              : <Icon size={12} />
                            }
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">
            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Page {meta.page} / {meta.totalPages}
            </span>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
