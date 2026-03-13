import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Users,
  CircleDot,
  Zap,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Loader2,
  AlertCircle
} from "lucide-react";
import { adminApi, type AdminStats } from "../../api";

const typeColorMap: Record<string, string> = {
  "Name Pick": "bg-blue-500",
  "Prize": "bg-salami-green",
  "Custom": "bg-amber-500",
  "Number": "bg-purple-500",
  "Yes/No": "bg-pink-500",
};

export function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.error || "Failed to load analytics");
        }
      })
      .catch(() => setError("An error occurred"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-salami-green" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">{error || "Failed to load analytics"}</h2>
      </div>
    );
  }

  // Format daily stats for chart
  const today = new Date();
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyStats.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      spins: stats.spinsPerDay[dateStr] || 0,
    });
  }
  const maxSpins = Math.max(...dailyStats.map((d) => d.spins), 10); // Minimum 10 to avoid division by 0

  // Format wheel types
  const totalTypedWheels = stats.wheelTypes?.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const wheelTypes = (stats.wheelTypes || []).map(wt => ({
    type: wt.type || "Unknown",
    count: wt.count,
    pct: ((wt.count / totalTypedWheels) * 100).toFixed(1),
    color: typeColorMap[wt.type] || "bg-gray-400"
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Analytics
        </h1>
        <p className="text-[0.875rem] text-muted-foreground">
          Platform performance and usage insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spins", value: stats.overview.totalSpins.toLocaleString(), icon: Zap, change: `+${stats.recent.spins} (7d)`, color: "from-salami-green to-salami-green-dark", trendUp: stats.recent.spins > 0 },
          { label: "Total Users", value: stats.overview.totalUsers.toLocaleString(), icon: Users, change: `+${stats.recent.users} (7d)`, color: "from-blue-500 to-blue-600", trendUp: stats.recent.users > 0 },
          { label: "Total Wheels", value: stats.overview.totalWheels.toLocaleString(), icon: CircleDot, change: `+${stats.recent.wheels} (7d)`, color: "from-amber-500 to-orange-500", trendUp: stats.recent.wheels > 0 },
          { label: "Active Wheels", value: stats.overview.activeWheels.toLocaleString(), icon: TrendingUp, change: `${Math.round(stats.overview.activeWheels / (stats.overview.totalWheels || 1) * 100)}% total`, color: "from-purple-500 to-purple-600", trendUp: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-border flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-[1.25rem] text-foreground inline-block" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[0.75rem] text-muted-foreground">{stat.label}</span>
              <span className={`text-[0.6875rem] ${stat.trendUp ? 'text-salami-green' : 'text-gray-500'}`} style={{ fontWeight: 600 }}>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Spins Bar Chart */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Weekly Spins
            </h2>
            <div className="flex items-center gap-1 text-[0.75rem] text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Last 7 days
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {dailyStats.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                  {d.spins >= 1000 ? `${(d.spins / 1000).toFixed(1)}k` : d.spins}
                </span>
                <motion.div
                  className="w-full bg-gradient-to-t from-salami-green to-salami-green/70 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.spins / maxSpins) * 160}px` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                />
                <span className="text-[0.6875rem] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performing Wheels */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Top Performing Wheels
            </h2>
            <CircleDot className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {stats.topWheels.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 text-sm">No wheel data yet.</div>
            ) : stats.topWheels.map((wheel, index) => (
              <div key={wheel.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-[0.6875rem] font-bold text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-[0.875rem] text-foreground truncate max-w-[140px]" style={{ fontWeight: 500 }} title={wheel.title}>
                      {wheel.title}
                    </span>
                  </div>
                  <span className="text-[0.875rem] text-salami-green" style={{ fontWeight: 600 }}>
                    {wheel.spins} spins
                  </span>
                </div>
                <div className="ml-7 text-[0.75rem] text-muted-foreground">
                  Owner: {wheel.owner}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel Types */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-foreground font-['Poppins',sans-serif] mb-5" style={{ fontWeight: 600 }}>
            Wheel Types Distribution
          </h2>
          <div className="space-y-4">
            {wheelTypes.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 text-sm">No wheels created yet.</div>
            ) : wheelTypes.map((wt) => (
              <div key={wt.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.875rem] text-foreground capitalize" style={{ fontWeight: 500 }}>
                    {wt.type}
                  </span>
                  <span className="text-[0.75rem] text-muted-foreground">
                    {wt.count.toLocaleString()} ({wt.pct}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${wt.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${wt.pct}%` }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Wheel Creations */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Recent Platform Activity
            </h2>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>New Users Joined</p>
                  <p className="text-[0.75rem] text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <span className="text-[1.125rem] text-blue-600 font-bold">+{stats.recent.users}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <CircleDot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>Wheels Created</p>
                  <p className="text-[0.75rem] text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <span className="text-[1.125rem] text-amber-600 font-bold">+{stats.recent.wheels}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-salami-green/5 rounded-xl border border-salami-green/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-salami-green/20 flex items-center justify-center text-salami-green">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>Total Spins</p>
                  <p className="text-[0.75rem] text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <span className="text-[1.125rem] text-salami-green font-bold">+{stats.recent.spins}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
