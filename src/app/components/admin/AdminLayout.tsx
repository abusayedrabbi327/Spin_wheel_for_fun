import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  CircleDot,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { isAdmin, logout, getAuthState } from "../../auth";
import { adminApi, type AdminStats } from "../../api";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "All Wheels", path: "/admin/wheels", icon: CircleDot },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const authState = getAuthState();
  const adminName = authState?.user?.name || authState?.email?.split("@")[0] || "Admin";
  const adminInitials = adminName.slice(0, 2).toUpperCase();

  // Protect admin routes - redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/login");
    } else {
      adminApi.getStats().then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      });
    }
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Don't render if not admin
  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-['Inter',sans-serif] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[0.9375rem] text-white font-['Poppins',sans-serif] block" style={{ fontWeight: 700 }}>
                SpinWheel
              </span>
              <span className="text-[0.625rem] text-red-400 uppercase tracking-widest" style={{ fontWeight: 600 }}>
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[0.875rem] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Admin Panel
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {stats && (stats.recent.users > 0 || stats.recent.wheels > 0) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-border bg-gray-50/50">
                        <h3 className="text-[0.875rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>Notifications</h3>
                        <p className="text-[0.75rem] text-muted-foreground">Recent platform activity (Last 7 days)</p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {!stats ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                        ) : stats.recent.users === 0 && stats.recent.wheels === 0 && stats.recent.spins === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <Bell className="w-6 h-6 text-gray-300" />
                            No new notifications
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {stats.recent.users > 0 && (
                              <div className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-[0.875rem] text-foreground"><span style={{ fontWeight: 600 }}>{stats.recent.users} new users</span> have joined the platform.</p>
                                  <p className="text-[0.75rem] text-muted-foreground mt-1">Recently</p>
                                </div>
                              </div>
                            )}
                            {stats.recent.wheels > 0 && (
                              <div className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                  <CircleDot className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-[0.875rem] text-foreground"><span style={{ fontWeight: 600 }}>{stats.recent.wheels} new wheels</span> were created.</p>
                                  <p className="text-[0.75rem] text-muted-foreground mt-1">Recently</p>
                                </div>
                              </div>
                            )}
                            {stats.recent.spins > 0 && (
                              <div className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-salami-green/10 flex items-center justify-center shrink-0">
                                  <BarChart3 className="w-4 h-4 text-salami-green" />
                                </div>
                                <div>
                                  <p className="text-[0.875rem] text-foreground"><span style={{ fontWeight: 600 }}>{stats.recent.spins} new spins</span> occurred.</p>
                                  <p className="text-[0.75rem] text-muted-foreground mt-1">Recently</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-border text-center bg-gray-50/50">
                        <Link to="/admin/analytics" className="text-[0.75rem] text-salami-green hover:text-salami-green-dark" style={{ fontWeight: 600 }}>
                          View All Analytics
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[0.75rem]" style={{ fontWeight: 600 }}>
                  {adminInitials}
                </div>
                <span className="hidden md:block text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                  {adminName}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
