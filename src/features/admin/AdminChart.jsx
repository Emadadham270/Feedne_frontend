import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

export function AdminChart({ stats }) {
  if (!stats) return null;

  const barData = [
    { name: 'Users',    value: stats.totalUsers },
    { name: 'Posts',    value: stats.totalPosts },
    { name: 'Groups',   value: stats.totalGroups },
  ];

  const pieData = [
    { name: 'Verified',   value: stats.totalVerifiedUsers },
    { name: 'Unverified', value: Math.max(0, stats.totalUsers - stats.totalVerifiedUsers) },
    { name: 'Blocked',    value: stats.totalBlockedUsers },
    { name: 'Admins',     value: stats.totalAdmins },
  ].filter((d) => d.value > 0);

  const growthData = [
    { name: 'New Users (30d)',  value: stats.newUsersLast30Days },
    { name: 'New Posts (30d)',  value: stats.newPostsLast30Days },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Platform Overview Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-5">Platform Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, color: '#f9fafb', fontSize: 13 }}
              cursor={{ fill: 'rgba(99,102,241,0.07)' }}
            />
            <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}
              fill="url(#barGradient)"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Breakdown Pie Chart */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-5">User Breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, color: '#f9fafb', fontSize: 13 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Growth in Last 30 Days */}
      <div className="lg:col-span-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-5">Activity Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={growthData} barSize={80}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.15)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, color: '#f9fafb', fontSize: 13 }}
              cursor={{ fill: 'rgba(99,102,241,0.07)' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {growthData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#6366f1' : '#ec4899'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
