import { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Lock, Bell, Save } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const [name, setName] = useState("Ahmed Hassan");
  const [email, setEmail] = useState("ahmed@example.com");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [spinNotifications, setSpinNotifications] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
              AH
            </div>
            <div>
              <div className="text-foreground" style={{ fontWeight: 500 }}>Ahmed Hassan</div>
              <div className="text-[0.875rem] text-muted-foreground">
                Member since Feb 2026
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
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              New Password
            </label>
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
            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Email Notifications
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Receive email updates about your campaigns
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  emailNotifications ? "bg-salami-green" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    emailNotifications ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Spin Notifications
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Get notified when someone spins your wheel
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpinNotifications(!spinNotifications)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  spinNotifications ? "bg-salami-green" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    spinNotifications ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
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
