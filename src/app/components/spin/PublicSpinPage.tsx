import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Dices, Phone, User, X, PartyPopper, Frown } from "lucide-react";
import confetti from "canvas-confetti";

type WheelType = "names" | "numbers" | "decisions" | "prizes" | "food" | "custom";

interface Segment {
  label: string;
  value: string;
  color: string;
}

interface WheelTheme {
  colors: string[];
  bgGradient: string;
  accentColor: string;
}

const WHEEL_THEMES: Record<WheelType, WheelTheme> = {
  names: {
    colors: ["#3B82F6", "#60A5FA", "#2563EB", "#93C5FD", "#1D4ED8", "#BFDBFE"],
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #3B82F6 30%, #60A5FA 70%, #93C5FD 100%)",
    accentColor: "#3B82F6",
  },
  numbers: {
    colors: ["#8B5CF6", "#A78BFA", "#7C3AED", "#C4B5FD", "#6D28D9", "#DDD6FE"],
    bgGradient: "linear-gradient(135deg, #4c1d95 0%, #7C3AED 30%, #A78BFA 70%, #C4B5FD 100%)",
    accentColor: "#8B5CF6",
  },
  decisions: {
    colors: ["#F59E0B", "#FBBF24", "#D97706", "#FCD34D", "#B45309", "#FDE68A"],
    bgGradient: "linear-gradient(135deg, #78350f 0%, #D97706 30%, #F59E0B 70%, #FCD34D 100%)",
    accentColor: "#F59E0B",
  },
  prizes: {
    colors: ["#0F9D58", "#34d399", "#0a7a44", "#6EE7B7", "#047857", "#A7F3D0"],
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #0F9D58 30%, #34d399 70%, #D4AF37 100%)",
    accentColor: "#0F9D58",
  },
  food: {
    colors: ["#EF4444", "#F87171", "#DC2626", "#FCA5A5", "#B91C1C", "#FECACA"],
    bgGradient: "linear-gradient(135deg, #7f1d1d 0%, #DC2626 30%, #F87171 70%, #FCA5A5 100%)",
    accentColor: "#EF4444",
  },
  custom: {
    colors: ["#0F9D58", "#D4AF37", "#0a7a44", "#c9a430", "#34d399", "#f59e0b"],
    bgGradient: "linear-gradient(135deg, #0a7a44 0%, #0F9D58 30%, #34d399 70%, #D4AF37 100%)",
    accentColor: "#0F9D58",
  },
};

// Demo wheel data - in real app, this would come from backend based on wheel type
const DEMO_WHEELS: Record<WheelType, { title: string; items: string[] }> = {
  names: {
    title: "Team Member Picker",
    items: ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank"],
  },
  numbers: {
    title: "Lucky Number Draw",
    items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  decisions: {
    title: "Decision Maker",
    items: ["Yes!", "No", "Maybe", "Ask Again", "Definitely", "Not Now"],
  },
  prizes: {
    title: "Prize Wheel",
    items: ["Grand Prize", "$100", "$50", "Free Gift", "$25", "Try Again", "Bonus Spin"],
  },
  food: {
    title: "What's for Dinner?",
    items: ["Pizza", "Tacos", "Sushi", "Burgers", "Pasta", "Salad", "Chinese", "Thai"],
  },
  custom: {
    title: "Friday Lunch - Who Pays?",
    items: ["You Pay!", "Free Pass", "Try Again", "$50 Tip", "Split Bill", "Rock Paper Scissors"],
  },
};

// Function to create segments from items with theme colors
function createSegments(items: string[], theme: WheelTheme): Segment[] {
  return items.map((label, i) => ({
    label,
    value: label.toLowerCase().replace(/\s+/g, "_"),
    color: theme.colors[i % theme.colors.length],
  }));
}

// Current wheel type - in real app, this would be fetched based on URL slug
const currentWheelType: WheelType = "custom";
const currentTheme = WHEEL_THEMES[currentWheelType];
const currentWheelData = DEMO_WHEELS[currentWheelType];
const segments = createSegments(currentWheelData.items, currentTheme);

function SpinWheel({
  spinning,
  rotation,
}: {
  spinning: boolean;
  rotation: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numSegments = segments.length;
  const segAngle = (2 * Math.PI) / numSegments;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-center, -center);

    // Draw segments
    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segments[i].color;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      const textAngle = startAngle + segAngle / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 2;
      ctx.fillText(segments[i].label, radius * 0.65, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Outer ring - use theme accent color
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Inner border
    ctx.beginPath();
    ctx.arc(center, center, radius - 3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Notches/dots around the rim
    for (let i = 0; i < numSegments * 3; i++) {
      const angle = (i * 2 * Math.PI) / (numSegments * 3);
      const dotX = center + (radius + 0) * Math.cos(angle);
      const dotY = center + (radius + 0) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = currentTheme.accentColor;
      ctx.fill();
    }

    ctx.restore();

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 36, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      32
    );
    grad.addColorStop(0, currentTheme.colors[0]);
    grad.addColorStop(1, currentTheme.colors[2] || currentTheme.colors[0]);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", center, center);
  }, [rotation, numSegments, segAngle]);

  return (
    <div className="relative">
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: `28px solid ${currentTheme.accentColor}`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
      </div>

      {/* Glow effect when spinning */}
      {spinning && (
        <div className="absolute inset-0 rounded-full bg-salami-green/20 blur-xl animate-pulse" />
      )}

      <canvas
        ref={canvasRef}
        width={380}
        height={380}
        className="w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px]"
      />
    </div>
  );
}

export function PublicSpinPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "spinning" | "result">("form");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Segment | null>(null);
  const [campaignEnded] = useState(false);
  const animFrameRef = useRef<number>(0);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#0F9D58", "#D4AF37", "#34d399", "#fbbf24", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#0F9D58", "#D4AF37", "#34d399", "#fbbf24", "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleSpin = () => {
    if (!name.trim() || !phone.trim()) return;

    setStep("spinning");
    setSpinning(true);

    // Pick random result
    const allOptions = [...segments];
    const randomIdx = Math.floor(Math.random() * allOptions.length);
    const winningSegment = allOptions[randomIdx];

    // Calculate target rotation
    const segAngle = 360 / segments.length;
    const targetSegmentAngle = randomIdx * segAngle;
    const targetRotation =
      360 * 8 + (360 - targetSegmentAngle - segAngle / 2);

    // Animate
    let startTime: number | null = null;
    const startRotation = rotation;
    const totalRotation = targetRotation - (startRotation % 360) + 360 * 5;
    const duration = 5000;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const currentRotation = startRotation + totalRotation * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(winningSegment);
        setStep("result");
        if (winningSegment.value !== "0") {
          fireConfetti();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const resetSpin = () => {
    setStep("form");
    setName("");
    setPhone("");
    setResult(null);
  };

  if (campaignEnded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-4"
        style={{
          background:
            "linear-gradient(135deg, #f0faf4 0%, #ffffff 40%, #faf3d9 100%)",
        }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Frown className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-[1.75rem] text-foreground mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            Wheel Closed
          </h1>
          <p className="text-muted-foreground mb-6">
            This spin wheel has ended. Thanks for stopping by!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] relative overflow-hidden"
      style={{
        background: currentTheme.bgGradient,
      }}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-4 h-4 bg-white/20 rounded-full"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-[30%] right-[10%] w-6 h-6 bg-salami-gold/30 rounded-full"
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[15%] w-3 h-3 bg-white/30 rounded-full"
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />

      {/* Header */}
      <div className="relative z-10 text-center pt-6 pb-4 px-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Dices className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/90 text-[0.875rem]" style={{ fontWeight: 600 }}>
            SpinWheel
          </span>
        </Link>
        <h1 className="text-[1.5rem] md:text-[1.75rem] text-white font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          {currentWheelData.title}
        </h1>
        <p className="text-white/70 text-[0.875rem]">
          Spin the wheel and let fate decide!
        </p>
      </div>

      {/* Wheel */}
      <div className="relative z-10 flex justify-center py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <SpinWheel spinning={spinning} rotation={rotation} />
        </motion.div>
      </div>

      {/* Form / Button */}
      <div className="relative z-10 px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              className="max-w-sm mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-white text-center mb-4 font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
                  Enter Your Details to Spin
                </h3>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSpin}
                  disabled={!name.trim() || !phone.trim()}
                  className="w-full mt-4 py-3.5 bg-white text-salami-green rounded-xl hover:bg-salami-gold hover:text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 700 }}
                >
                  SPIN THE WHEEL!
                </button>
              </div>
            </motion.div>
          )}

          {step === "spinning" && (
            <motion.div
              key="spinning"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-sm mx-auto border border-white/20">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <p className="text-white text-[1.125rem] font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
                    Spinning...
                  </p>
                </motion.div>
                <p className="text-white/60 text-[0.875rem] mt-1">
                  Good luck, {name}!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {step === "result" && result && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <button
                onClick={resetSpin}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted-foreground hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {result.value !== "0" ? (
                <>
                  <motion.div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center mx-auto mb-4"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <PartyPopper className="w-10 h-10 text-white" />
                  </motion.div>

                  <h2 className="text-[1.5rem] text-foreground mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
                    The Wheel Has Spoken!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Here's your result, {name}:
                  </p>

                  <motion.div
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-salami-green to-salami-gold rounded-2xl mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <span className="text-[2rem] text-white font-['Poppins',sans-serif]" style={{ fontWeight: 800 }}>
                      {result.label}
                    </span>
                  </motion.div>

                  <p className="text-[0.875rem] text-muted-foreground">
                    No take-backs! The wheel never lies.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Frown className="w-10 h-10 text-gray-400" />
                  </div>

                  <h2 className="text-[1.5rem] text-foreground mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
                    Try Again!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    The wheel says to try again next time, {name}!
                  </p>
                </>
              )}

              <button
                onClick={resetSpin}
                className="w-full py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all"
                style={{ fontWeight: 600 }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
