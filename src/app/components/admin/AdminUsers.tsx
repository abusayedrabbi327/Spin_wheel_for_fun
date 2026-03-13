import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Search,
  MoreVertical,
  Ban,
  Trash2,
  Eye,
  UserCheck,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminUser } from "../../api";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All"); // Role simulation
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [search, filterStatus]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(50, 0, search);
      if (res.success && res.data) {
        let fetchedUsers = res.data.users;

        // Frontend filtering by Role map to Status
        if (filterStatus === "Admins") {
          fetchedUsers = fetchedUsers.filter(u => u.role === "ADMIN");
        } else if (filterStatus === "Users") {
          fetchedUsers = fetchedUsers.filter(u => u.role === "USER");
        }

        setUsers(fetchedUsers);
        setTotal(res.data.total);
      } else {
        setError(res.error || "Failed to load users");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: "USER" | "ADMIN") => {
    setOpenMenuId(null);
    setIsUpdating(userId);
    try {
      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
      const res = await adminApi.updateUserRole(userId, newRole);

      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole}`);
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will permanently delete the user and all their wheels and spins.")) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setIsUpdating(userId);
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.success) {
        setUsers(users.filter(u => u.id !== userId));
        setTotal(t => t - 1);
        toast.success("User deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete user");
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
            User Management
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            {total} total users on the platform
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
          {["All", "Users", "Admins"].map((s) => (
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
                      User
                    </th>
                    <th className="text-left px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Role
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
                    <th className="text-right px-5 py-3 text-[0.75rem] text-muted-foreground tracking-wider uppercase" style={{ fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.625rem] shrink-0" style={{ fontWeight: 700 }}>
                            {user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                              {user.name || "Anonymous User"}
                            </div>
                            <div className="text-[0.75rem] text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] ${user.role === "ADMIN"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-gray-100 text-gray-500"
                            }`}
                          style={{ fontWeight: 600 }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {user.wheelCount}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {user.totalSpins.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isUpdating === user.id ? (
                          <div className="flex justify-end pr-2">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
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
                                  {user.role === "USER" ? (
                                    <button
                                      onClick={() => toggleRole(user.id, user.role)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      Make Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => toggleRole(user.id, user.role)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-amber-600 hover:bg-amber-50 transition-colors"
                                    >
                                      <Ban className="w-4 h-4" />
                                      Remove Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-[0.8125rem] text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
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
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[0.6875rem]" style={{ fontWeight: 700 }}>
                        {user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                          {user.name || "Anonymous User"}
                        </div>
                        <div className="text-[0.75rem] text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] ${user.role === "ADMIN"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      style={{ fontWeight: 600 }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[0.75rem] text-muted-foreground">
                    <span>{user.wheelCount} wheels</span>
                    <span>{user.totalSpins.toLocaleString()} spins</span>
                  </div>
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No users found matching your search.
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
