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
} from "lucide-react";

const dailyStats = [
  { day: "Mon", spins: 1240, users: 45 },
  { day: "Tue", spins: 1890, users: 62 },
  { day: "Wed", spins: 2100, users: 78 },
  { day: "Thu", spins: 1750, users: 55 },
  { day: "Fri", spins: 3200, users: 120 },
  { day: "Sat", spins: 4100, users: 156 },
  { day: "Sun", spins: 3800, users: 142 },
];

const maxSpins = Math.max(...dailyStats.map((d) => d.spins));

const topCountries = [
  { country: "United States", users: 423, pct: 34 },
  { country: "United Kingdom", users: 187, pct: 15 },
  { country: "Canada", users: 156, pct: 12.5 },
  { country: "Germany", users: 98, pct: 7.9 },
  { country: "Australia", users: 87, pct: 7 },
  { country: "Others", users: 296, pct: 23.6 },
];

const wheelTypes = [
  { type: "Name Picker", count: 1456, pct: 37.4, color: "bg-blue-500" },
  { type: "Prize Wheel", count: 1203, pct: 30.9, color: "bg-salami-green" },
  { type: "Custom", count: 789, pct: 20.3, color: "bg-amber-500" },
  { type: "Number", count: 443, pct: 11.4, color: "bg-purple-500" },
];

const deviceStats = [
  { device: "Mobile", pct: 62, icon: Smartphone, color: "text-blue-500" },
  { device: "Desktop", pct: 31, icon: Monitor, color: "text-salami-green" },
  { device: "Tablet", pct: 7, icon: Monitor, color: "text-amber-500" },
];

export function AdminAnalytics() {
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
          { label: "This Week Spins", value: "18,080", icon: Zap, change: "+24%", color: "from-salami-green to-salami-green-dark" },
          { label: "New Users (7d)", value: "658", icon: Users, change: "+18%", color: "from-blue-500 to-blue-600" },
          { label: "New Wheels (7d)", value: "312", icon: CircleDot, change: "+15%", color: "from-amber-500 to-orange-500" },
          { label: "Avg Spins/Wheel", value: "12.4", icon: TrendingUp, change: "+8%", color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-[1.25rem] text-foreground" style={{ fontWeight: 700 }}>
              {stat.value}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] text-muted-foreground">{stat.label}</span>
              <span className="text-[0.6875rem] text-salami-green" style={{ fontWeight: 600 }}>{stat.change}</span>
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

        {/* Device Breakdown */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-foreground font-['Poppins',sans-serif] mb-6" style={{ fontWeight: 600 }}>
            Device Breakdown
          </h2>
          <div className="space-y-5">
            {deviceStats.map((d) => (
              <div key={d.device}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <d.icon className={`w-4 h-4 ${d.color}`} />
                    <span className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                      {d.device}
                    </span>
                  </div>
                  <span className="text-[0.875rem] text-foreground" style={{ fontWeight: 600 }}>
                    {d.pct}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      d.device === "Mobile"
                        ? "bg-blue-500"
                        : d.device === "Desktop"
                        ? "bg-salami-green"
                        : "bg-amber-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  />
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
            {wheelTypes.map((wt) => (
              <div key={wt.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
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

        {/* Top Countries */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Top Countries
            </h2>
          </div>
          <div className="space-y-3">
            {topCountries.map((c, i) => (
              <div key={c.country} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[0.625rem] text-muted-foreground" style={{ fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                    {c.country}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.75rem] text-muted-foreground">
                    {c.users} users
                  </span>
                  <span className="text-[0.75rem] text-foreground w-12 text-right" style={{ fontWeight: 600 }}>
                    {c.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
