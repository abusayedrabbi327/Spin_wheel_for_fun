import { motion } from "motion/react";
import {
  Users,
  CircleDot,
  Zap,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Total Wheels",
    value: "3,891",
    change: "+18%",
    trend: "up",
    icon: CircleDot,
    color: "from-salami-green to-salami-green-dark",
  },
  {
    label: "Total Spins",
    value: "48,320",
    change: "+24%",
    trend: "up",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
  },
  {
    label: "Active Wheels",
    value: "892",
    change: "-3%",
    trend: "down",
    icon: Activity,
    color: "from-purple-500 to-purple-600",
  },
];

const recentUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", wheels: 8, spins: 234, joined: "Feb 23, 2026", status: "Active" },
  { id: 2, name: "Mike Chen", email: "mike@example.com", wheels: 15, spins: 567, joined: "Feb 22, 2026", status: "Active" },
  { id: 3, name: "Emily Davis", email: "emily@example.com", wheels: 3, spins: 89, joined: "Feb 21, 2026", status: "Active" },
  { id: 4, name: "James Wilson", email: "james@example.com", wheels: 22, spins: 1203, joined: "Feb 20, 2026", status: "Active" },
  { id: 5, name: "Lisa Park", email: "lisa@example.com", wheels: 1, spins: 12, joined: "Feb 19, 2026", status: "Suspended" },
];

const topWheels = [
  { id: 1, name: "Company Raffle 2026", owner: "James Wilson", spins: 1203, status: "Active" },
  { id: 2, name: "Friday Lunch Roulette", owner: "Mike Chen", spins: 567, status: "Active" },
  { id: 3, name: "Classroom Helper Picker", owner: "Emily Davis", spins: 342, status: "Active" },
  { id: 4, name: "Birthday Prize Wheel", owner: "Sarah Johnson", spins: 234, status: "Closed" },
  { id: 5, name: "Tip Jar Splitter", owner: "Mike Chen", spins: 189, status: "Active" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[1.75rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Admin Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide statistics and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[0.75rem] ${
                  stat.trend === "up" ? "text-salami-green" : "text-red-500"
                }`}
                style={{ fontWeight: 600 }}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="text-[1.5rem] text-foreground" style={{ fontWeight: 700 }}>
              {stat.value}
            </div>
            <div className="text-[0.875rem] text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Recent Users
            </h2>
            <a
              href="/admin/users"
              className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
              style={{ fontWeight: 500 }}
            >
              View All
            </a>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.625rem] shrink-0" style={{ fontWeight: 700 }}>
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.875rem] text-foreground truncate" style={{ fontWeight: 500 }}>
                      {user.name}
                    </div>
                    <div className="text-[0.75rem] text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[0.75rem] text-muted-foreground hidden sm:block">
                    {user.wheels} wheels
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${
                      user.status === "Active"
                        ? "bg-salami-green-light text-salami-green"
                        : "bg-red-50 text-red-500"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Wheels */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Top Wheels by Spins
            </h2>
            <a
              href="/admin/wheels"
              className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
              style={{ fontWeight: 500 }}
            >
              View All
            </a>
          </div>
          <div className="divide-y divide-border">
            {topWheels.map((wheel, i) => (
              <div key={wheel.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-salami-green-light text-salami-green flex items-center justify-center text-[0.75rem] shrink-0" style={{ fontWeight: 700 }}>
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.875rem] text-foreground truncate" style={{ fontWeight: 500 }}>
                      {wheel.name}
                    </div>
                    <div className="text-[0.75rem] text-muted-foreground truncate">
                      by {wheel.owner}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[0.75rem] text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {wheel.spins}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${
                      wheel.status === "Active"
                        ? "bg-salami-green-light text-salami-green"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {wheel.status}
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
