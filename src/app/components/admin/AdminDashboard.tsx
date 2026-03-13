import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Users,
  CircleDot,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { adminApi, type AdminStats, type AdminUser } from "../../api";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(5, 0) // fetch 5 most recent
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (usersRes.success && usersRes.data) setRecentUsers(usersRes.data.users);

        setError(null);
      } catch (err) {
        setError("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        <h2 className="text-xl font-semibold">{error || "Failed to load"}</h2>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.overview.totalUsers.toLocaleString(),
      change: `+${stats.recent.users} recent`,
      trend: stats.recent.users > 0 ? "up" : "neutral",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Wheels",
      value: stats.overview.totalWheels.toLocaleString(),
      change: `+${stats.recent.wheels} recent`,
      trend: stats.recent.wheels > 0 ? "up" : "neutral",
      icon: CircleDot,
      color: "from-salami-green to-salami-green-dark",
    },
    {
      label: "Total Spins",
      value: stats.overview.totalSpins.toLocaleString(),
      change: `+${stats.recent.spins} recent`,
      trend: stats.recent.spins > 0 ? "up" : "neutral",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Active Wheels",
      value: stats.overview.activeWheels.toLocaleString(),
      change: `${Math.round((stats.overview.activeWheels / (stats.overview.totalWheels || 1)) * 100)}% active`,
      trend: "up",
      icon: Activity,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
        {statCards.map((stat, i) => (
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
                className={`inline-flex items-center gap-1 text-[0.75rem] ${stat.trend === "up" ? "text-salami-green" : stat.trend === "down" ? "text-red-500" : "text-gray-500"
                  }`}
                style={{ fontWeight: 600 }}
              >
                {stat.trend === "up" && <ArrowUpRight className="w-3.5 h-3.5" />}
                {stat.trend === "down" && <ArrowDownRight className="w-3.5 h-3.5" />}
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
          className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Recent Users
            </h2>
            <Link
              to="/admin/users"
              className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
              style={{ fontWeight: 500 }}
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">No users found.</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.625rem] shrink-0" style={{ fontWeight: 700 }}>
                      {user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.875rem] text-foreground truncate" style={{ fontWeight: 500 }}>
                        {user.name || "Anonymous User"}
                      </div>
                      <div className="text-[0.75rem] text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[0.75rem] text-muted-foreground hidden sm:block">
                      {user.wheelCount} wheels
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${user.role === "ADMIN"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-salami-green-light text-salami-green"
                        }`}
                      style={{ fontWeight: 600 }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Wheels */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
              Top Wheels by Spins
            </h2>
            <Link
              to="/admin/wheels"
              className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
              style={{ fontWeight: 500 }}
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.topWheels.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">No wheel data available.</div>
            ) : (
              stats.topWheels.map((wheel, i) => (
                <div key={wheel.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-salami-green-light text-salami-green flex items-center justify-center text-[0.75rem] shrink-0" style={{ fontWeight: 700 }}>
                      #{i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.875rem] text-foreground truncate" style={{ fontWeight: 500 }}>
                        {wheel.title}
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
                      className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${wheel.isActive
                          ? "bg-salami-green-light text-salami-green"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      style={{ fontWeight: 600 }}
                    >
                      {wheel.isActive ? "Active" : "Closed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
