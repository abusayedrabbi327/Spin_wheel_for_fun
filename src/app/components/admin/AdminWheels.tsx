import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
  ExternalLink,
  Download,
  CircleDot,
  Zap,
  Users,
} from "lucide-react";

const allWheels = [
  { id: 1, name: "Company Raffle 2026", owner: "James Wilson", type: "Prize", items: 8, spins: 1203, status: "Active", created: "Feb 20, 2026" },
  { id: 2, name: "Friday Lunch Roulette", owner: "Mike Chen", type: "Name Pick", items: 6, spins: 567, status: "Active", created: "Feb 18, 2026" },
  { id: 3, name: "Classroom Helper Picker", owner: "Emily Davis", type: "Name Pick", items: 25, spins: 342, status: "Active", created: "Feb 17, 2026" },
  { id: 4, name: "Birthday Prize Wheel", owner: "Sarah Johnson", type: "Prize", items: 10, spins: 234, status: "Closed", created: "Feb 15, 2026" },
  { id: 5, name: "Tip Jar Splitter", owner: "Mike Chen", type: "Number", items: 5, spins: 189, status: "Active", created: "Feb 14, 2026" },
  { id: 6, name: "Team Building Challenge", owner: "David Kim", type: "Custom", items: 12, spins: 156, status: "Active", created: "Feb 13, 2026" },
  { id: 7, name: "Karaoke Song Picker", owner: "Anna Lopez", type: "Custom", items: 30, spins: 98, status: "Active", created: "Feb 12, 2026" },
  { id: 8, name: "Office Gift Exchange", owner: "Tom Brown", type: "Name Pick", items: 15, spins: 87, status: "Closed", created: "Feb 10, 2026" },
  { id: 9, name: "Dinner Menu Decider", owner: "Kevin Hart", type: "Custom", items: 8, spins: 65, status: "Active", created: "Feb 9, 2026" },
  { id: 10, name: "Weekly Chore Assign", owner: "Sarah Johnson", type: "Name Pick", items: 6, spins: 234, status: "Flagged", created: "Feb 8, 2026" },
];

export function AdminWheels() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filtered = allWheels.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.owner.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            All Wheels
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            {allWheels.length} wheels across the platform
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[0.875rem] text-foreground hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-salami-green-light flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-salami-green" />
          </div>
          <div>
            <div className="text-[1.125rem] text-foreground" style={{ fontWeight: 700 }}>3,891</div>
            <div className="text-[0.75rem] text-muted-foreground">Total Wheels</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-[1.125rem] text-foreground" style={{ fontWeight: 700 }}>48,320</div>
            <div className="text-[0.75rem] text-muted-foreground">Total Spins</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <Ban className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-[1.125rem] text-foreground" style={{ fontWeight: 700 }}>3</div>
            <div className="text-[0.75rem] text-muted-foreground">Flagged</div>
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
            placeholder="Search by wheel name or owner..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Closed", "Flagged"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-[0.8125rem] transition-all ${
                filterStatus === s
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
        className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
              {filtered.map((wheel) => (
                <tr
                  key={wheel.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                        {wheel.name}
                      </div>
                      <div className="text-[0.75rem] text-muted-foreground">
                        {wheel.created}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {wheel.owner}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                      {wheel.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {wheel.items}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {wheel.spins.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.6875rem] ${
                        wheel.status === "Active"
                          ? "bg-salami-green-light text-salami-green"
                          : wheel.status === "Flagged"
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {wheel.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
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
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-foreground hover:bg-gray-50 transition-colors">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-foreground hover:bg-gray-50 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                              Open Spin Page
                            </button>
                            {wheel.status !== "Flagged" ? (
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-amber-600 hover:bg-amber-50 transition-colors">
                                <Ban className="w-4 h-4" />
                                Flag Wheel
                              </button>
                            ) : (
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-salami-green hover:bg-salami-green-light/50 transition-colors">
                                <CircleDot className="w-4 h-4" />
                                Unflag
                              </button>
                            )}
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                              Delete Wheel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.map((wheel) => (
            <div
              key={wheel.id}
              className="p-4 rounded-xl border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                  {wheel.name}
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${
                    wheel.status === "Active"
                      ? "bg-salami-green-light text-salami-green"
                      : wheel.status === "Flagged"
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {wheel.status}
                </span>
              </div>
              <div className="text-[0.75rem] text-muted-foreground mb-2">
                by {wheel.owner}
              </div>
              <div className="flex gap-4 text-[0.75rem] text-muted-foreground">
                <span>{wheel.type}</span>
                <span>{wheel.items} items</span>
                <span>{wheel.spins.toLocaleString()} spins</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No wheels found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  );
}
