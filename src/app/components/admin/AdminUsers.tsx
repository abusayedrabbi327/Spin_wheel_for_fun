import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  MoreVertical,
  Ban,
  Trash2,
  Eye,
  UserCheck,
  Download,
  Filter,
} from "lucide-react";

const allUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", wheels: 8, totalSpins: 234, joined: "Feb 23, 2026", status: "Active", plan: "Pro" },
  { id: 2, name: "Mike Chen", email: "mike@example.com", wheels: 15, totalSpins: 567, joined: "Feb 22, 2026", status: "Active", plan: "Pro" },
  { id: 3, name: "Emily Davis", email: "emily@example.com", wheels: 3, totalSpins: 89, joined: "Feb 21, 2026", status: "Active", plan: "Free" },
  { id: 4, name: "James Wilson", email: "james@example.com", wheels: 22, totalSpins: 1203, joined: "Feb 20, 2026", status: "Active", plan: "Enterprise" },
  { id: 5, name: "Lisa Park", email: "lisa@example.com", wheels: 1, totalSpins: 12, joined: "Feb 19, 2026", status: "Suspended", plan: "Free" },
  { id: 6, name: "David Kim", email: "david@example.com", wheels: 6, totalSpins: 145, joined: "Feb 18, 2026", status: "Active", plan: "Pro" },
  { id: 7, name: "Anna Lopez", email: "anna@example.com", wheels: 4, totalSpins: 78, joined: "Feb 17, 2026", status: "Active", plan: "Free" },
  { id: 8, name: "Tom Brown", email: "tom@example.com", wheels: 11, totalSpins: 389, joined: "Feb 16, 2026", status: "Active", plan: "Pro" },
  { id: 9, name: "Rachel Green", email: "rachel@example.com", wheels: 0, totalSpins: 0, joined: "Feb 15, 2026", status: "Inactive", plan: "Free" },
  { id: 10, name: "Kevin Hart", email: "kevin@example.com", wheels: 9, totalSpins: 456, joined: "Feb 14, 2026", status: "Active", plan: "Pro" },
];

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            User Management
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            {allUsers.length} total users on the platform
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[0.875rem] text-foreground hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Suspended", "Inactive"].map((s) => (
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
                  User
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Plan
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Wheels
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Total Spins
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                  Joined
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
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.625rem] shrink-0" style={{ fontWeight: 700 }}>
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                          {user.name}
                        </div>
                        <div className="text-[0.75rem] text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] ${
                        user.plan === "Enterprise"
                          ? "bg-purple-50 text-purple-600"
                          : user.plan === "Pro"
                          ? "bg-salami-gold-light text-salami-gold"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {user.wheels}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {user.totalSpins.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                    {user.joined}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.6875rem] ${
                        user.status === "Active"
                          ? "bg-salami-green-light text-salami-green"
                          : user.status === "Suspended"
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white rounded-xl shadow-lg border border-border py-1">
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-foreground hover:bg-gray-50 transition-colors">
                              <Eye className="w-4 h-4" />
                              View Profile
                            </button>
                            {user.status === "Suspended" ? (
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-salami-green hover:bg-salami-green-light/50 transition-colors">
                                <UserCheck className="w-4 h-4" />
                                Reactivate
                              </button>
                            ) : (
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-amber-600 hover:bg-amber-50 transition-colors">
                                <Ban className="w-4 h-4" />
                                Suspend
                              </button>
                            )}
                            <button className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                              Delete User
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
          {filtered.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-xl border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.6875rem]" style={{ fontWeight: 700 }}>
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                      {user.name}
                    </div>
                    <div className="text-[0.75rem] text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${
                    user.status === "Active"
                      ? "bg-salami-green-light text-salami-green"
                      : user.status === "Suspended"
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {user.status}
                </span>
              </div>
              <div className="flex gap-4 text-[0.75rem] text-muted-foreground">
                <span>{user.wheels} wheels</span>
                <span>{user.totalSpins.toLocaleString()} spins</span>
                <span>{user.plan}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  );
}
