import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Star, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAuthState } from "../../auth";
import { authApi } from "../../api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    // Try to login via API
    setIsLoading(true);
    try {
      const result = await authApi.login(email, password);

      if (result.success && result.data) {
        // Store user info in auth state
        setAuthState({
          isAuthenticated: true,
          role: result.data.user.role === "ADMIN" ? "admin" : "user",
          email: result.data.user.email,
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name || undefined,
            role: result.data.user.role
          }
        });
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-['Inter',sans-serif] relative"
      style={{
        background:
          "linear-gradient(135deg, #f0faf4 0%, #ffffff 40%, #faf3d9 100%)",
      }}
    >
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F9D58' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-salami-green to-salami-green-dark flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-[1.25rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              Salami Wheels
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-[1.5rem] text-foreground mb-1 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-[0.875rem]">
              Sign in to manage your Ramadan wheels
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-salami-green accent-[#0F9D58]"
                />
                <span className="text-[0.875rem] text-muted-foreground" style={{ fontWeight: 400 }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-[0.875rem] text-salami-green hover:text-salami-green-dark"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-lg shadow-salami-green/25 disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[0.875rem] text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-salami-green hover:text-salami-green-dark"
                style={{ fontWeight: 500 }}
              >
                Create one
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}