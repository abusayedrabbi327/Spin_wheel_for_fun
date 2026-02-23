import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
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
import { isAdmin, logout } from "../../auth";

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

  // Protect admin routes - redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/login");
    }
  }, [navigate]);

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
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
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-[0.75rem]" style={{ fontWeight: 600 }}>
                  SA
                </div>
                <span className="hidden md:block text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                  Super Admin
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
