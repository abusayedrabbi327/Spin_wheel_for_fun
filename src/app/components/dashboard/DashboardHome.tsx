import { Link } from "react-router";
import { motion } from "motion/react";
import {
  CircleDot,
  Users,
  Zap,
  Trophy,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";

const stats = [
  {
    label: "Total Wheels",
    value: "12",
    change: "+3 this month",
    icon: CircleDot,
    color: "from-salami-green to-salami-green-dark",
  },
  {
    label: "Total Participants",
    value: "284",
    change: "+47 this week",
    icon: Users,
    color: "from-salami-gold to-[#b8942e]",
  },
  {
    label: "Active Campaigns",
    value: "4",
    change: "2 ending soon",
    icon: Zap,
    color: "from-emerald-400 to-emerald-600",
  },
  {
    label: "Total Winners",
    value: "156",
    change: "+23 this week",
    icon: Trophy,
    color: "from-amber-400 to-amber-600",
  },
];

const recentCampaigns = [
  {
    id: "1",
    name: "Friday Lunch - Who Pays?",
    status: "Active",
    participants: 45,
    winners: 12,
    created: "Feb 18, 2026",
  },
  {
    id: "2",
    name: "Team Giveaway Raffle",
    status: "Active",
    participants: 28,
    winners: 8,
    created: "Feb 15, 2026",
  },
  {
    id: "3",
    name: "Classroom Random Picker",
    status: "Closed",
    participants: 67,
    winners: 20,
    created: "Feb 10, 2026",
  },
  {
    id: "4",
    name: "Birthday Party Prize Wheel",
    status: "Active",
    participants: 34,
    winners: 10,
    created: "Feb 8, 2026",
  },
  {
    id: "5",
    name: "Holiday Gift Exchange",
    status: "Closed",
    participants: 89,
    winners: 30,
    created: "Jan 28, 2026",
  },
];

export function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-[1.75rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Welcome back, Ahmed!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your wheels today.
        </p>
      </div>

      {/* Stats */}
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
              <ArrowUpRight className="w-4 h-4 text-salami-green" />
            </div>
            <div className="text-[1.5rem] text-foreground" style={{ fontWeight: 700 }}>
              {stat.value}
            </div>
            <div className="text-[0.875rem] text-muted-foreground">
              {stat.label}
            </div>
            <div className="text-[0.75rem] text-salami-green mt-1" style={{ fontWeight: 500 }}>
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Recent Campaigns
          </h2>
          <Link
            to="/dashboard/wheels"
            className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
            style={{ fontWeight: 500 }}
          >
            View All
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Campaign
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Status
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Participants
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Winners
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Created
                </th>
                <th className="text-right px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b border-border last:border-0 hover:bg-salami-green-light/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                      {campaign.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] ${
                        campaign.status === "Active"
                          ? "bg-salami-green-light text-salami-green"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {campaign.participants}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {campaign.winners}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {campaign.created}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/dashboard/campaign/${campaign.id}`}
                      className="inline-flex items-center gap-1 text-[0.875rem] text-salami-green hover:text-salami-green-dark"
                      style={{ fontWeight: 500 }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {recentCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/dashboard/campaign/${campaign.id}`}
              className="block p-4 rounded-xl border border-border hover:border-salami-green/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  {campaign.name}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[0.75rem] ${
                    campaign.status === "Active"
                      ? "bg-salami-green-light text-salami-green"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {campaign.status}
                </span>
              </div>
              <div className="flex gap-4 text-[0.75rem] text-muted-foreground">
                <span>{campaign.participants} participants</span>
                <span>{campaign.winners} winners</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}