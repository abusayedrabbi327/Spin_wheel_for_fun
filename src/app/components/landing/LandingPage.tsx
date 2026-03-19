import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Sparkles,
  Link2,
  Users,
  Trophy,
  ArrowRight,
  Dices,
  MoonStar,
  Zap,
  Target,
} from "lucide-react";
import { isAuthenticated, getAuthState } from "../../auth";

const features = [
  {
    icon: Sparkles,
    title: "Create Ramadan Wheels",
    description:
      "Build simple wheels for iftar teams, gift draws, and family activities.",
  },
  {
    icon: Link2,
    title: "Share One Simple Link",
    description:
      "Send your wheel link to friends and family so everyone can join instantly.",
  },
  {
    icon: Users,
    title: "Track Every Spin",
    description:
      "See participant names and outcomes in one clean dashboard.",
  },
  {
    icon: Trophy,
    title: "Pick Fair Winners",
    description:
      "Use fair random picks for giveaways and Ramadan community events.",
  },
];

const useCases = [
  { label: "Iftar Host Picker", icon: "🌙" },
  { label: "Suhoor Menu Vote", icon: "🥘" },
  { label: "Masjid Giveaway", icon: "🎁" },
  { label: "Family Quiz Teams", icon: "👨‍👩‍👧‍👦" },
  { label: "Charity Draw", icon: "🤲" },
  { label: "Kids Activity Pick", icon: "🧒" },
];

const steps = [
  {
    num: "01",
    icon: Target,
    title: "Create Your Ramadan Wheel",
    description:
      "Add names, tasks, or prize items in less than a minute.",
  },
  {
    num: "02",
    icon: Link2,
    title: "Share the Link",
    description:
      "Share through WhatsApp or social media so everyone can join.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Spin and Celebrate",
    description:
      "Spin live during gatherings and get instant fair results.",
  },
];

function SpinWheelIllustration() {
  const segments = [
    { color: "#0F9D58", label: "Alice" },
    { color: "#D4AF37", label: "$50" },
    { color: "#0a7a44", label: "Bob" },
    { color: "#c9a430", label: "Pizza" },
    { color: "#34d399", label: "Sarah" },
    { color: "#f59e0b", label: "$100" },
    { color: "#0F9D58", label: "Skip" },
    { color: "#D4AF37", label: "Mike" },
  ];

  return (
    <motion.div
      className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
        {segments.map((seg, i) => {
          const angle = (360 / segments.length) * i;
          const nextAngle = (360 / segments.length) * (i + 1);
          const startRad = (angle * Math.PI) / 180;
          const endRad = (nextAngle * Math.PI) / 180;
          const x1 = 200 + 190 * Math.cos(startRad);
          const y1 = 200 + 190 * Math.sin(startRad);
          const x2 = 200 + 190 * Math.cos(endRad);
          const y2 = 200 + 190 * Math.sin(endRad);
          const midAngle = ((angle + nextAngle) / 2) * (Math.PI / 180);
          const tx = 200 + 130 * Math.cos(midAngle);
          const ty = 200 + 130 * Math.sin(midAngle);
          const textRot = (angle + nextAngle) / 2;

          return (
            <g key={i}>
              <path
                d={`M200,200 L${x1},${y1} A190,190 0 0,1 ${x2},${y2} Z`}
                fill={seg.color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRot}, ${tx}, ${ty})`}
                style={{ fontSize: "16px", fontFamily: "Inter, sans-serif" }}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        <circle cx="200" cy="200" r="40" fill="white" />
        <circle
          cx="200"
          cy="200"
          r="36"
          fill="#0F9D58"
          stroke="#D4AF37"
          strokeWidth="3"
        />
        <text
          x="200"
          y="200"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
          }}
        >
          SPIN
        </text>
      </svg>
    </motion.div>
  );
}

export function LandingPage() {
  const isAuth = isAuthenticated();
  const isAdminUser = getAuthState()?.role === "admin" || (getAuthState()?.role as string) === "ADMIN";
  const dashboardLink = isAdminUser ? "/admin" : "/dashboard";

  return (
    <div
      className="min-h-screen bg-white font-['Inter',sans-serif]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 50%, rgba(15,157,88,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.03) 0%, transparent 50%)",
      }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-salami-green to-salami-green-dark flex items-center justify-center">
              <Dices className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1.125rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              Spin Wheels
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <Link
                to={dashboardLink}
                className="px-5 py-2 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-salami-green hover:bg-salami-green-light rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-salami-gold-light text-salami-gold rounded-full mb-6">
              <MoonStar className="w-4 h-4" />
              <span className="text-[0.875rem]">Ramadan Edition</span>
            </div>
            <h1 className="text-[2.5rem] md:text-[3.5rem] text-foreground mb-6 font-['Poppins',sans-serif]" style={{ fontWeight: 800, lineHeight: 1.1 }}>
              Salami Wheels,{" "}
              <span className="bg-gradient-to-r from-salami-green to-salami-gold bg-clip-text text-transparent">
                Ramadan Nights Made Simple
              </span>
            </h1>
            <p className="text-[1.125rem] text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Create simple themed wheels for iftar planning, community events,
              and fair prize draws. Share one link and let everyone spin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={isAuth ? "/dashboard/create" : "/register"}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-salami-green text-white rounded-2xl hover:bg-salami-green-dark transition-all shadow-lg shadow-salami-green/25 hover:shadow-salami-green/40"
              >
                Create a Wheel
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuth && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-salami-green text-salami-green rounded-2xl hover:bg-salami-green-light transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-salami-green/10 to-salami-gold/10 rounded-full blur-3xl" />
              <SpinWheelIllustration />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Marquee */}
      <section className="py-12 border-y border-border bg-salami-green-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground text-[0.875rem] mb-6" style={{ fontWeight: 500 }}>
            Perfect for Ramadan gatherings
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((uc) => (
              <div
                key={uc.label}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm"
              >
                <span>{uc.icon}</span>
                <span className="text-[0.875rem] text-foreground" style={{ fontWeight: 500 }}>
                  {uc.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-white to-salami-green-light/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[2rem] md:text-[2.5rem] text-foreground mb-4 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              Simple, Useful, Fair
            </h2>
            <p className="text-muted-foreground text-[1.125rem] max-w-2xl mx-auto">
              A lightweight wheel app for quick Ramadan activities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg hover:border-salami-green/20 transition-all group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-salami-green to-salami-green-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-foreground mb-2 font-['Poppins',sans-serif]">{feature.title}</h3>
                <p className="text-muted-foreground text-[0.875rem]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[2rem] md:text-[2.5rem] text-foreground mb-4 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
              How It Works
            </h2>
            <p className="text-muted-foreground text-[1.125rem] max-w-2xl mx-auto">
              Three quick steps for your Ramadan wheel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-salami-green/10 to-salami-gold/10 mb-6 relative">
                  <step.icon className="w-8 h-8 text-salami-green" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-salami-gold text-white flex items-center justify-center text-[0.75rem]" style={{ fontWeight: 700 }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-foreground mb-2 font-['Poppins',sans-serif]">{step.title}</h3>
                <p className="text-muted-foreground text-[0.875rem] max-w-xs mx-auto">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-salami-green/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-salami-green to-salami-green-dark p-12 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-[2rem] md:text-[2.5rem] text-white mb-4 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
                Ready for Ramadan Spins?
              </h2>
              <p className="text-white/80 text-[1.125rem] mb-8 max-w-lg mx-auto">
                Create your first Salami Wheel in seconds and run fair picks at
                your next iftar or community event.
              </p>
              <Link
                to={isAuth ? dashboardLink : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-salami-green rounded-2xl hover:bg-salami-gold hover:text-white transition-all shadow-lg"
                style={{ fontWeight: 600 }}
              >
                {isAuth ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center">
                  <Dices className="w-5 h-5 text-white" />
                </div>
                <span className="text-[1.125rem] font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
                  Spin Wheels
                </span>
              </div>
              <p className="text-white/60 text-[0.875rem] max-w-sm">
                A simple Ramadan-themed wheel app for family activities,
                giveaways, and community events.
              </p>
            </div>
            <div>
              <h4 className="text-white/40 text-[0.75rem] tracking-wider uppercase mb-4" style={{ fontWeight: 600 }}>
                Platform
              </h4>
              <ul className="space-y-2">
                {["Features", "How it Works", "Pricing", "FAQ"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/60 hover:text-salami-green text-[0.875rem] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/40 text-[0.75rem] tracking-wider uppercase mb-4" style={{ fontWeight: 600 }}>
                Legal
              </h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Contact Us"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/60 hover:text-salami-green text-[0.875rem] transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-[0.875rem]">
            &copy; 2026 Salami Wheels. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
