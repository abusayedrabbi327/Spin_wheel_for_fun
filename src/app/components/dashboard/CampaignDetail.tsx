import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Users,
  Trophy,
  Zap,
  Target,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const campaignData = {
  id: "1",
  name: "Friday Lunch - Who Pays?",
  status: "Active",
  publicLink: "https://spinwheel.app/spin/friday-lunch",
  totalSpins: 45,
  totalWinners: 12,
  maxWinners: 20,
  remainingSlots: 8,
  expiry: "Mar 15, 2026",
  created: "Feb 18, 2026",
};

const participants = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 555-0101",
    prize: "You Pay!",
    time: "Feb 23, 2026 10:30 AM",
  },
  {
    id: 2,
    name: "Mike Chen",
    phone: "+1 555-0102",
    prize: "Free Lunch",
    time: "Feb 23, 2026 09:15 AM",
  },
  {
    id: 3,
    name: "Emily Davis",
    phone: "+1 555-0103",
    prize: "You Pay!",
    time: "Feb 22, 2026 08:45 PM",
  },
  {
    id: 4,
    name: "James Wilson",
    phone: "+1 555-0104",
    prize: "Skip",
    time: "Feb 22, 2026 07:20 PM",
  },
  {
    id: 5,
    name: "Lisa Park",
    phone: "+1 555-0105",
    prize: "Free Lunch",
    time: "Feb 22, 2026 05:10 PM",
  },
  {
    id: 6,
    name: "David Kim",
    phone: "+1 555-0106",
    prize: "You Pay!",
    time: "Feb 22, 2026 03:00 PM",
  },
  {
    id: 7,
    name: "Anna Lopez",
    phone: "+1 555-0107",
    prize: "Free Lunch",
    time: "Feb 21, 2026 11:30 AM",
  },
  {
    id: 8,
    name: "Tom Brown",
    phone: "+1 555-0108",
    prize: "Skip",
    time: "Feb 21, 2026 09:45 AM",
  },
];

const statCards = [
  { label: "Total Spins", value: campaignData.totalSpins, icon: Zap, color: "from-salami-green to-salami-green-dark" },
  { label: "Total Winners", value: campaignData.totalWinners, icon: Trophy, color: "from-salami-gold to-[#b8942e]" },
  { label: "Remaining Slots", value: campaignData.remainingSlots, icon: Target, color: "from-emerald-400 to-emerald-600" },
  { label: "Max Winners", value: campaignData.maxWinners, icon: Users, color: "from-amber-400 to-amber-600" },
];

export function CampaignDetail() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(campaignData.publicLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-salami-green-light transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              {campaignData.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.75rem] bg-salami-green-light text-salami-green" style={{ fontWeight: 500 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-salami-green" />
                {campaignData.status}
              </span>
              <span className="text-[0.875rem] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Expires {campaignData.expiry}
              </span>
            </div>
          </div>
        </div>
        <Link
          to="/spin/friday-lunch"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-sm text-[0.875rem]"
          style={{ fontWeight: 500 }}
        >
          <ExternalLink className="w-4 h-4" />
          Open Spin Page
        </Link>
      </div>

      {/* Public Link */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="block text-[0.875rem] text-foreground mb-2" style={{ fontWeight: 500 }}>
          Public Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-input-background border border-border text-[0.875rem] text-muted-foreground truncate">
            {campaignData.publicLink}
          </div>
          <button
            onClick={copyLink}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[0.875rem] ${
              copied
                ? "bg-salami-green text-white"
                : "border border-border hover:border-salami-green hover:text-salami-green"
            }`}
            style={{ fontWeight: 500 }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
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
            <div className="text-[0.75rem] text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Participants Table */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-5 border-b border-border">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Participants
          </h2>
          <p className="text-[0.875rem] text-muted-foreground">
            {participants.length} total responses
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Name
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Prize
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-salami-green-light/30 transition-colors"
                >
                  <td className="px-5 py-3.5 text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                    {p.name}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {p.phone}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] ${
                        p.prize === "Skip"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-salami-gold-light text-salami-gold"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {p.prize}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {p.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  {p.name}
                </span>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] ${
                    p.prize === "Skip"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-salami-gold-light text-salami-gold"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {p.prize}
                </span>
              </div>
              <div className="flex justify-between text-[0.75rem] text-muted-foreground">
                <span>{p.phone}</span>
                <span>{p.time.split(" ").slice(0, 3).join(" ")}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}