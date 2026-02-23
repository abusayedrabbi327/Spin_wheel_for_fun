import { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Globe,
  Bell,
  Palette,
  Save,
  CircleDot,
  Users,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
  const [platformName, setPlatformName] = useState("SpinWheel");
  const [supportEmail, setSupportEmail] = useState("support@spinwheel.app");
  const [maxWheelsPerUser, setMaxWheelsPerUser] = useState("50");
  const [maxItemsPerWheel, setMaxItemsPerWheel] = useState("100");
  const [maxSpinsPerWheel, setMaxSpinsPerWheel] = useState("10000");
  const [allowPublicWheels, setAllowPublicWheels] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [allowSignups, setAllowSignups] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNewUser, setEmailNewUser] = useState(true);
  const [emailFlaggedWheel, setEmailFlaggedWheel] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings saved successfully!");
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        value ? "bg-salami-green" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
          value ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Platform Settings
        </h1>
        <p className="text-[0.875rem] text-muted-foreground">
          Configure global platform behavior and limits
        </p>
      </div>

      <motion.form
        onSubmit={handleSave}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Globe className="w-5 h-5 text-blue-500" />
            General
          </h2>

          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
            />
          </div>

          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Support Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100">
            <div>
              <div className="text-foreground text-[0.875rem] flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                <Shield className="w-4 h-4 text-red-500" />
                Maintenance Mode
              </div>
              <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                Temporarily disable all public pages
              </div>
            </div>
            <Toggle value={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
          </div>
        </div>

        {/* Limits */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <CircleDot className="w-5 h-5 text-salami-green" />
            Limits & Quotas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                Max Wheels / User
              </label>
              <input
                type="number"
                value={maxWheelsPerUser}
                onChange={(e) => setMaxWheelsPerUser(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
              />
            </div>
            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                Max Items / Wheel
              </label>
              <input
                type="number"
                value={maxItemsPerWheel}
                onChange={(e) => setMaxItemsPerWheel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
              />
            </div>
            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                Max Spins / Wheel
              </label>
              <input
                type="number"
                value={maxSpinsPerWheel}
                onChange={(e) => setMaxSpinsPerWheel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
              />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Users className="w-5 h-5 text-purple-500" />
            Access Control
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Allow Public Signups
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Let new users register on the platform
                </div>
              </div>
              <Toggle value={allowSignups} onChange={() => setAllowSignups(!allowSignups)} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Require Email Verification
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Users must verify email before creating wheels
                </div>
              </div>
              <Toggle value={requireEmailVerification} onChange={() => setRequireEmailVerification(!requireEmailVerification)} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Allow Public Wheels
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Users can share wheels via public links
                </div>
              </div>
              <Toggle value={allowPublicWheels} onChange={() => setAllowPublicWheels(!allowPublicWheels)} />
            </div>
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Bell className="w-5 h-5 text-amber-500" />
            Admin Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  New User Signup
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Get notified when a new user registers
                </div>
              </div>
              <Toggle value={emailNewUser} onChange={() => setEmailNewUser(!emailNewUser)} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
              <div>
                <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                  Flagged Wheel Alert
                </div>
                <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Get notified when a wheel is flagged for review
                </div>
              </div>
              <Toggle value={emailFlaggedWheel} onChange={() => setEmailFlaggedWheel(!emailFlaggedWheel)} />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a1a2e] text-white rounded-xl hover:bg-[#252545] transition-all shadow-lg shadow-black/10"
          style={{ fontWeight: 600 }}
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </motion.form>
    </div>
  );
}
