import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Dices, Phone, User, X, PartyPopper, Frown, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { wheelsApi, spinsApi, type Wheel } from "../../api";

interface Segment {
  label: string;
  color: string;
}

const PALETTE = [
  "#0F9D58", "#D4AF37", "#0a7a44", "#c9a430", "#34d399",
  "#f59e0b", "#3B82F6", "#8B5CF6", "#EF4444", "#EC4899",
];

function createSegments(items: { label: string }[]): Segment[] {
  return items.map((item, i) => ({
    label: item.label,
    color: PALETTE[i % PALETTE.length],
  }));
}

function SpinCanvas({
  segments,
  spinning,
  rotation,
  accentColor,
}: {
  segments: Segment[];
  spinning: boolean;
  rotation: number;
  accentColor: string;
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

    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segments[i].color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      const textAngle = startAngle + segAngle / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = `bold ${numSegments > 8 ? 11 : 13}px Inter, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 3;
      const maxLen = 14;
      const text = segments[i].label.length > maxLen
        ? segments[i].label.slice(0, maxLen - 1) + "…"
        : segments[i].label;
      ctx.fillText(text, radius * 0.65, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.stroke();

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
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", center, center);
  }, [rotation, numSegments, segAngle, segments, accentColor]);

  return (
    <div className="relative">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: `28px solid ${accentColor}`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
      </div>
      {spinning && (
        <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
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
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"loading" | "form" | "spinning" | "result">("loading");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Segment | null>(null);
  const [saving, setSaving] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Load wheel by slug
  useEffect(() => {
    if (!slug) return;
    wheelsApi.getPublic(slug).then((res) => {
      if (res.success && res.data) {
        setWheel(res.data);
        setSegments(createSegments(res.data.items));
        setStep("form");
      } else {
        setLoadError(res.error || "Wheel not found");
        setStep("form");
      }
    });
  }, [slug]);

  const accentColor = "#0F9D58";
  const bgGradient = "linear-gradient(135deg, #0a7a44 0%, #0F9D58 30%, #34d399 70%, #D4AF37 100%)";

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#0F9D58", "#D4AF37", "#34d399"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#0F9D58", "#D4AF37", "#34d399"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleSpin = () => {
    if (!name.trim() || !phone.trim() || segments.length === 0) return;
    if (!wheel) return;

    setStep("spinning");
    setSpinning(true);

    const randomIdx = Math.floor(Math.random() * segments.length);
    const winningSegment = segments[randomIdx];
    const segAngle = 360 / segments.length;
    const targetSegmentAngle = randomIdx * segAngle;
    const targetRotation = 360 * 8 + (360 - targetSegmentAngle - segAngle / 2);

    let startTime: number | null = null;
    const startRotation = rotation;
    const totalRotation = targetRotation - (startRotation % 360) + 360 * 5;
    const duration = 5000;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setRotation(startRotation + totalRotation * easeOutCubic(progress));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(winningSegment);
        setStep("result");
        fireConfetti();

        // Save spin to database
        setSaving(true);
        spinsApi.record(
          wheel.id,
          winningSegment.label,
          name.trim(),
          phone.trim()
        ).finally(() => setSaving(false));
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

  // Show loading state
  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgGradient }}>
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="font-semibold text-lg">Loading wheel...</p>
        </div>
      </div>
    );
  }

  // Show error if wheel not found
  if (loadError || !wheel) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-4" style={{ background: bgGradient }}>
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Frown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[1.75rem] text-white mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            Wheel Not Found
          </h1>
          <p className="text-white/70 mb-6">{loadError || "This wheel doesn't exist or has been removed."}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-salami-green rounded-xl hover:bg-salami-gold hover:text-white transition-all">
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Show inactive wheel
  if (!wheel.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-4" style={{ background: bgGradient }}>
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Frown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[1.75rem] text-white mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>Wheel Closed</h1>
          <p className="text-white/70 mb-6">This spin wheel has ended. Thanks for stopping by!</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-salami-green rounded-xl hover:bg-salami-gold hover:text-white transition-all">
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif] relative overflow-hidden" style={{ background: bgGradient }}>
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Floating bubbles */}
      <motion.div className="absolute top-[10%] left-[5%] w-4 h-4 bg-white/20 rounded-full" animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.div className="absolute top-[30%] right-[10%] w-6 h-6 bg-salami-gold/30 rounded-full" animate={{ y: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />

      {/* Header */}
      <div className="relative z-10 text-center pt-6 pb-4 px-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Dices className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/90 text-[0.875rem]" style={{ fontWeight: 600 }}>Salami Wheels</span>
        </Link>
        <h1 className="text-[1.5rem] md:text-[1.75rem] text-white font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          {wheel.title}
        </h1>
        <p className="text-white/70 text-[0.875rem]">
          {wheel.items.length} options · Spin the wheel and let fate decide!
        </p>
      </div>

      {/* Wheel */}
      <div className="relative z-10 flex justify-center py-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }}>
          <SpinCanvas segments={segments} spinning={spinning} rotation={rotation} accentColor={accentColor} />
        </motion.div>
      </div>

      {/* Form / Spinning state */}
      <div className="relative z-10 px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" className="max-w-sm mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
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
            <motion.div key="spinning" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-sm mx-auto border border-white/20">
                <motion.p className="text-white text-[1.125rem] font-['Poppins',sans-serif]" style={{ fontWeight: 600 }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  Spinning...
                </motion.p>
                <p className="text-white/60 text-[0.875rem] mt-1">Good luck, {name}!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {step === "result" && result && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 15 }}>
              <button onClick={resetSpin} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted-foreground hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>

              <motion.div className="w-20 h-20 rounded-full bg-gradient-to-br from-salami-green to-salami-gold flex items-center justify-center mx-auto mb-4" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <PartyPopper className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-[1.5rem] text-foreground mb-2 font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>The Wheel Has Spoken!</h2>
              <p className="text-muted-foreground mb-4">Here's your result, <strong>{name}</strong>:</p>

              <motion.div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-salami-green to-salami-gold rounded-2xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <span className="text-[2rem] text-white font-['Poppins',sans-serif]" style={{ fontWeight: 800 }}>{result.label}</span>
              </motion.div>

              {saving ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-4">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving your result...
                </p>
              ) : (
                <p className="text-[0.875rem] text-salami-green mb-4" style={{ fontWeight: 500 }}>✓ Result saved!</p>
              )}

              <p className="text-[0.75rem] text-muted-foreground mb-5">No take-backs! The wheel never lies.</p>

              <button onClick={resetSpin} className="w-full py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all" style={{ fontWeight: 600 }}>
                Spin Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
