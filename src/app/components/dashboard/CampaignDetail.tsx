import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router";
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
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { wheelsApi, spinsApi, Wheel, Spin } from "../../api";

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const [campaign, setCampaign] = useState<Wheel | null>(null);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [wheelRes, spinsRes] = await Promise.all([
          wheelsApi.get(id),
          spinsApi.list(id)
        ]);

        if (wheelRes.success && wheelRes.data) {
          setCampaign(wheelRes.data);
        } else {
          setError("Failed to load campaign details");
        }

        if (spinsRes.success && spinsRes.data) {
          setSpins(spinsRes.data.spins || []);
        } else {
          // Log error but don't fail the entire page load if spins fail
          console.warn("Failed to load spins:", spinsRes.error);
          setSpins([]);
        }
      } catch (err) {
        console.error("Error loading campaign data:", err);
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-salami-green" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Error Loading Campaign</h2>
          <p className="text-muted-foreground mt-1">{error || "Campaign not found"}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-salami-green text-white rounded-lg hover:bg-salami-green-dark"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/spin/${campaign.slug}`;

  const remainingSlots = campaign.maxSpins ? campaign.maxSpins - spins.length : "Unlimited";

  // Format dates safely
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const statCards = [
    { label: "Total Spins", value: spins.length, icon: Zap, color: "from-salami-green to-salami-green-dark" },
    { label: "Total Options", value: campaign.items.length, icon: Trophy, color: "from-salami-gold to-[#b8942e]" },
    { label: "Remaining Slots", value: remainingSlots, icon: Target, color: "from-emerald-400 to-emerald-600" },
    { label: "Max Total Spins", value: campaign.maxSpins || "∞", icon: Users, color: "from-amber-400 to-amber-600" },
    { label: "Max Per Person", value: campaign.maxSpinsPerParticipant || "∞", icon: Users, color: "from-indigo-400 to-indigo-600" },
  ];

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
              {campaign.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.75rem] ${campaign.isActive ? 'bg-salami-green-light text-salami-green' : 'bg-red-100 text-red-600'}`} style={{ fontWeight: 500 }}>
                <span className={`w-1.5 h-1.5 rounded-full ${campaign.isActive ? 'bg-salami-green' : 'bg-red-500'}`} />
                {campaign.isActive ? "Active" : "Closed"}
              </span>
              {campaign.expiryDate && (
                <span className="text-[0.875rem] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Expires {formatDateTime(campaign.expiryDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/spin/${campaign.slug}`}
          target="_blank"
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
            {publicUrl}
          </div>
          <button
            onClick={() => copyLink(publicUrl)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[0.875rem] ${copied
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            Participants & Results
          </h2>
          <p className="text-[0.875rem] text-muted-foreground">
            {spins.length} total spins recorded
          </p>
        </div>

        {spins.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No spins have been recorded for this wheel yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Phone / Info
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Result
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spins.map((spin) => (
                    <tr
                      key={spin.id}
                      className="border-b border-border last:border-0 hover:bg-salami-green-light/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                        {spin.participantName}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {spin.participantPhone || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] bg-salami-gold-light text-salami-gold"
                          style={{ fontWeight: 600 }}
                        >
                          {spin.result}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {formatDateTime(spin.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {spins.map((spin) => (
                <div
                  key={spin.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                      {spin.participantName}
                    </span>
                    <span
                      className="inline-flex px-2.5 py-0.5 rounded-full text-[0.75rem] bg-salami-gold-light text-salami-gold"
                      style={{ fontWeight: 600 }}
                    >
                      {spin.result}
                    </span>
                  </div>
                  <div className="flex justify-between text-[0.75rem] text-muted-foreground">
                    <span>{spin.participantPhone || "No info"}</span>
                    <span>{formatDateTime(spin.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}