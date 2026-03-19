import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CircleDot,
  PlusCircle,
  Settings,
  Sparkles,
  MessageSquare,
  Swords,
  LogOut,
  Dices,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  BellOff,
} from "lucide-react";
import { toast } from "sonner";
import { isAuthenticated, logout, getAuthState } from "../../auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Progress", path: "/dashboard/progress", icon: Sparkles },
  { label: "AI Game Coach", path: "/dashboard/ai-coach", icon: MessageSquare },
  { label: "Challenges", path: "/dashboard/challenges", icon: Swords },
  { label: "My Wheels", path: "/dashboard/wheels", icon: CircleDot },
  { label: "Create Wheel", path: "/dashboard/create", icon: PlusCircle },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const authState = getAuthState();
  const userName = authState?.user?.name || authState?.user?.email?.split("@")[0] || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              Spin Wheels
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
              {/* Notifications dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  className="relative text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    </div>
                    <div className="py-8 text-center">
                      <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                      <p className="text-xs text-muted-foreground mt-1">We'll notify you when something happens</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center text-white text-[0.75rem]" style={{ fontWeight: 600 }}>
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                    {userName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground hidden md:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{authState?.user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        toast.success("Logged out successfully");
                        navigate("/login");
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
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