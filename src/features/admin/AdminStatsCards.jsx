import { Users, FileText, Layers, ShieldCheck, Ban, Crown } from 'lucide-react';

const STAT_CARDS = [
  { key: 'totalUsers',       label: 'Total Users',       icon: Users,        color: 'from-blue-500 to-indigo-600' },
  { key: 'totalPosts',       label: 'Total Posts',       icon: FileText,     color: 'from-purple-500 to-pink-600' },
  { key: 'totalGroups',      label: 'Total Groups',      icon: Layers,       color: 'from-emerald-500 to-teal-600' },
  { key: 'totalVerifiedUsers', label: 'Verified Users',  icon: ShieldCheck,  color: 'from-green-500 to-lime-500' },
  { key: 'totalBlockedUsers',  label: 'Blocked Users',   icon: Ban,          color: 'from-red-500 to-rose-600' },
  { key: 'totalAdmins',      label: 'Admins',            icon: Crown,        color: 'from-amber-500 to-orange-500' },
];

export function AdminStatsCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Gradient orb */}
          <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-10`} />
          
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
            <Icon size={20} className="text-white" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {stats?.[key] ?? 0}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}
