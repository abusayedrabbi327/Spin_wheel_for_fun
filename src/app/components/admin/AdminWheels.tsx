import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  ExternalLink,
  Download,
  CircleDot,
  Zap,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminWheel, wheelsApi } from "../../api";

export function AdminWheels() {
  const [wheels, setWheels] = useState<AdminWheel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalWheels, setTotalWheels] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadWheels();
    // Load top-level stats to get aggregate spins
    adminApi.getStats().then(res => {
      if (res.success && res.data) {
        setTotalSpins(res.data.overview.totalSpins);
      }
    });
  }, [search, filterStatus]);

  const loadWheels = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWheels(50, 0, search, filterStatus);
      if (res.success && res.data) {
        setWheels(res.data.wheels);
        setTotalWheels(res.data.total);
      } else {
        setError(res.error || "Failed to load wheels");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteWheel = async (wheelId: string) => {
    if (!confirm("Are you sure? This will delete the wheel and all its spins permanently.")) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setIsUpdating(wheelId);
    try {
      const res = await wheelsApi.delete(wheelId);
      if (res.success) {
        setWheels(wheels.filter(w => w.id !== wheelId));
        setTotalWheels(t => t - 1);
        toast.success("Wheel deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete wheel");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            All Wheels
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            {totalWheels} wheels across the platform
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[0.875rem] text-foreground hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-salami-green-light flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-salami-green" />
          </div>
          <div>
            <div className="text-[1.125rem] text-foreground" style={{ fontWeight: 700 }}>{totalWheels.toLocaleString()}</div>
            <div className="text-[0.75rem] text-muted-foreground">Total Wheels</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-[1.125rem] text-foreground" style={{ fontWeight: 700 }}>{totalSpins.toLocaleString()}</div>
            <div className="text-[0.75rem] text-muted-foreground">Total Spins</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by wheel title..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-[0.8125rem] transition-all ${filterStatus === s
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground"
                }`}
              style={{ fontWeight: 500 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-salami-green" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold text-foreground">{error}</h2>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Wheel
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Owner
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Type
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Items
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Spins
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="text-right px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wheels.map((wheel) => (
                    <tr
                      key={wheel.id}
                      className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                            {wheel.title}
                          </div>
                          <div className="text-[0.75rem] text-muted-foreground">
                            {new Date(wheel.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        <div className="text-foreground">{wheel.owner?.name || "Anonymous"}</div>
                        <div className="text-[0.7rem]">{wheel.owner?.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                          {wheel.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {wheel.itemCount}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {wheel.totalSpins.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.6875rem] ${wheel.isActive
                              ? "bg-salami-green-light text-salami-green"
                              : "bg-gray-100 text-gray-500"
                            }`}
                          style={{ fontWeight: 600 }}
                        >
                          {wheel.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isUpdating === wheel.id ? (
                          <div className="flex justify-end pr-2">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === wheel.id ? null : wheel.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === wheel.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white rounded-xl shadow-lg border border-border py-1">
                                  <Link to={`/dashboard/campaign/${wheel.id}`} className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-foreground hover:bg-gray-50 transition-colors">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </Link>
                                  <Link to={`/spin/${wheel.slug}`} target="_blank" className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-foreground hover:bg-gray-50 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    Open Spin Page
                                  </Link>
                                  <button onClick={() => deleteWheel(wheel.id)} className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Wheel
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {wheels.map((wheel) => (
                <div
                  key={wheel.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                      {wheel.title}
                    </div>
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
                  <div className="text-[0.75rem] text-muted-foreground mb-2">
                    by {wheel.owner?.name || "Anonymous"}
                  </div>
                  <div className="flex gap-4 text-[0.75rem] text-muted-foreground">
                    <span>{wheel.type}</span>
                    <span>{wheel.itemCount} items</span>
                    <span>{wheel.totalSpins.toLocaleString()} spins</span>
                  </div>
                </div>
              ))}
            </div>

            {wheels.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No wheels found matching your search.
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
