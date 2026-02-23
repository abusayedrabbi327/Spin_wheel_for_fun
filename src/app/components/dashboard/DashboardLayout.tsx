import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CircleDot,
  PlusCircle,
  Settings,
  LogOut,
  Dices,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { isAuthenticated, logout } from "../../auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Wheels", path: "/dashboard/wheels", icon: CircleDot },
  { label: "Create Wheel", path: "/dashboard/create", icon: PlusCircle },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protect dashboard routes - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] font-['Inter',sans-serif] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-salami-green to-salami-green-dark flex items-center justify-center">
              <Dices className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              SpinWheel
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-salami-green text-white shadow-sm"
                    : "text-muted-foreground hover:bg-salami-green-light hover:text-salami-green"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all w-full"
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

            <div className="hidden lg:block" />

            <div className="flex items-center gap-4">
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-salami-green rounded-full" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center text-white text-[0.75rem]" style={{ fontWeight: 600 }}>
                  AH
                </div>
                <span className="hidden md:block text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                  Ahmed Hassan
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