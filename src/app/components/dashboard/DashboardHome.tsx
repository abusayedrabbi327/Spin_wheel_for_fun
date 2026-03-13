import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  CircleDot,
  Zap,
  Trophy,
  ArrowUpRight,
  Eye,
  Loader2,
  InboxIcon,
} from "lucide-react";
import { getAuthState } from "../../auth";
import { wheelsApi, spinsApi, type Wheel } from "../../api";

export function DashboardHome() {
  const authState = getAuthState();
  const userName = authState?.user?.name || authState?.user?.email?.split("@")[0] || "there";

  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [totalSpins, setTotalSpins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await wheelsApi.list();
        if (result.success && result.data) {
          setWheels(result.data);
          // Compute total spins across all wheels
          const spinTotal = result.data.reduce(
            (sum, w) => sum + (w._count?.spins ?? 0),
            0
          );
          setTotalSpins(spinTotal);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeWheels = wheels.filter((w) => w.isActive);

  const stats = [
    {
      label: "Total Wheels",
      value: loading ? "—" : wheels.length.toString(),
      change: loading ? "" : `${activeWheels.length} active`,
      icon: CircleDot,
      color: "from-salami-green to-salami-green-dark",
    },
    {
      label: "Active Wheels",
      value: loading ? "—" : activeWheels.length.toString(),
      change: loading ? "" : `${wheels.length - activeWheels.length} inactive`,
      icon: Zap,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Total Spins",
      value: loading ? "—" : totalSpins.toString(),
      change: "Across all your wheels",
      icon: Trophy,
      color: "from-amber-400 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-[1.75rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your wheels today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-salami-green" />
            </div>
            <div className="text-[1.5rem] text-foreground" style={{ fontWeight: 700 }}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stat.value}
            </div>
            <div className="text-[0.875rem] text-muted-foreground">{stat.label}</div>
            {stat.change && (
              <div className="text-[0.75rem] text-salami-green mt-1" style={{ fontWeight: 500 }}>
                {stat.change}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent Wheels */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Your Wheels
          </h2>
          <Link
            to="/dashboard/wheels"
            className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
            style={{ fontWeight: 500 }}
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-salami-green" />
          </div>
        ) : wheels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <InboxIcon className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-foreground font-semibold mb-1">No wheels yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't created any wheels yet. Get started!
            </p>
            <Link
              to="/dashboard/create"
              className="px-5 py-2.5 rounded-xl bg-salami-green text-white text-sm hover:bg-salami-green-dark transition-colors"
              style={{ fontWeight: 600 }}
            >
              Create Your First Wheel
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Wheel Name", "Type", "Status", "Spins", "Actions"].map((h) => (
                      <th key={h} className={`${h === "Actions" ? "text-right" : "text-left"} px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase`} style={{ fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wheels.slice(0, 5).map((wheel) => (
                    <tr key={wheel.id} className="border-b border-border last:border-0 hover:bg-salami-green-light/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                          {wheel.title}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[0.75rem] text-muted-foreground capitalize">
                          {wheel.type.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] ${wheel.isActive
                            ? "bg-salami-green-light text-salami-green"
                            : "bg-gray-100 text-gray-500"
                            }`}
                          style={{ fontWeight: 500 }}
                        >
                          {wheel.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {wheel._count?.spins ?? 0}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/dashboard/campaign/${wheel.id}`}
                          className="inline-flex items-center gap-1 text-[0.875rem] text-salami-green hover:text-salami-green-dark"
                          style={{ fontWeight: 500 }}
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {wheels.slice(0, 5).map((wheel) => (
                <Link
                  key={wheel.id}
                  to={`/dashboard/campaign/${wheel.id}`}
                  className="block p-4 rounded-xl border border-border hover:border-salami-green/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                      {wheel.title}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[0.75rem] ${wheel.isActive ? "bg-salami-green-light text-salami-green" : "bg-gray-100 text-gray-500"
                        }`}
                      style={{ fontWeight: 500 }}
                    >
                      {wheel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-[0.75rem] text-muted-foreground">
                    {wheel._count?.spins ?? 0} spins · {wheel.type.toLowerCase()}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}