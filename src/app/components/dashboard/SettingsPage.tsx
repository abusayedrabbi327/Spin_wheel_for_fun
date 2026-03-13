import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Lock, Bell, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthState, setAuthState } from "../../auth";
import { authApi } from "../../api";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SettingsPage() {
  const authState = getAuthState();
  const storedName = authState?.user?.name || authState?.email?.split("@")[0] || "";
  const storedEmail = authState?.user?.email || authState?.email || "";

  const [name, setName] = useState(storedName);
  const [email, setEmail] = useState(storedEmail);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [spinNotifications, setSpinNotifications] = useState(true);

  const initials = getInitials(name || email.split("@")[0] || "U");

  useEffect(() => {
    // Fetch fresh user data from API to ensure up to date
    authApi.me().then((result) => {
      if (result.success && result.data) {
        const user = (result.data as any).user || result.data;
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.createdAt) {
          setMemberSince(
            new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          );
        }
      }
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Update local auth state with new name
    setAuthState({
      ...authState,
      isAuthenticated: true,
      role: authState.role,
      email: email,
      user: {
        ...authState.user,
        email,
        name,
      },
    });
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Settings
        </h1>
        <p className="text-[0.875rem] text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <motion.form
        onSubmit={handleSave}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <User className="w-5 h-5 text-salami-green" />
            Profile
          </h2>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center text-white text-[1.25rem]" style={{ fontWeight: 700 }}>
              {initials}
            </div>
            <div>
              <div className="text-foreground" style={{ fontWeight: 500 }}>{name || email}</div>
              <div className="text-[0.875rem] text-muted-foreground">
                {memberSince ? `Member since ${memberSince}` : (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Lock className="w-5 h-5 text-salami-green" />
            Change Password
          </h2>
          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Bell className="w-5 h-5 text-salami-green" />
            Notifications
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Email Notifications",
                desc: "Receive email updates about your campaigns",
                value: emailNotifications,
                setter: setEmailNotifications,
              },
              {
                label: "Spin Notifications",
                desc: "Get notified when someone spins your wheel",
                value: spinNotifications,
                setter: setSpinNotifications,
              },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} className="flex items-center justify-between p-4 rounded-xl bg-input-background">
                <div>
                  <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>{label}</div>
                  <div className="text-[0.75rem] text-muted-foreground mt-0.5">{desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setter(!value)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${value ? "bg-salami-green" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${value ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-lg shadow-salami-green/25"
          style={{ fontWeight: 600 }}
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </motion.form>
    </div>
  );
}
