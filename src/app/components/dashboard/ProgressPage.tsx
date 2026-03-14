import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, Flame, Gift, Wand2, Loader2, CalendarRange } from "lucide-react";
import { aiApi, eventsApi, progressApi, stickersApi, type AIRecommendation, type EventView, type ProgressSummary, type StickerItem } from "../../api";

const rarityClasses: Record<string, string> = {
  COMMON: "bg-gray-100 text-gray-700",
  RARE: "bg-sky-100 text-sky-700",
  EPIC: "bg-violet-100 text-violet-700",
  LEGENDARY: "bg-amber-100 text-amber-700",
  MYTHIC: "bg-rose-100 text-rose-700",
};

export function ProgressPage() {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [eventData, setEventData] = useState<EventView | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [p, s, e] = await Promise.all([
          progressApi.me(),
          stickersApi.list(),
          eventsApi.active(),
        ]);

        if (p.success && p.data) setProgress(p.data);
        if (s.success && s.data) setStickers(s.data.stickers);
        if (e.success && e.data) setEventData(e.data.activeEvent);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const ownedStickers = useMemo(() => stickers.filter((s) => s.owned), [stickers]);
  const recentOwned = useMemo(() => ownedStickers.slice(-6).reverse(), [ownedStickers]);

  async function getAIPlan() {
    setAiLoading(true);
    try {
      const result = await aiApi.recommend({
        mood: "fun and energetic",
        groupSize: 5,
        occasion: eventData?.occasion || "family",
        durationMinutes: 20,
        hasKids: true,
      });

      if (result.success && result.data) {
        setRecommendation(result.data.recommendation);
      }
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[320px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-salami-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Progress and Rewards
        </h1>
        <p className="text-[0.875rem] text-muted-foreground mt-1">
          Track your XP, sticker collection, and active event missions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Sparkles} label="Level" value={progress?.level ?? 1} sub={`XP ${progress?.xp ?? 0}`} />
        <StatCard icon={Flame} label="Streak" value={progress?.streakDays ?? 0} sub="days active" />
        <StatCard icon={Gift} label="Stickers" value={progress?.stickers.totalOwned ?? 0} sub="collected" />
      </div>

      <motion.div
        className="bg-white border border-border rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Level Progress
          </h2>
          <span className="text-xs text-muted-foreground">
            Next level in {progress?.levelProgress.neededForNext ?? 0} XP
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-salami-green to-emerald-500"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  ((progress?.levelProgress.progressInLevel ?? 0) /
                    Math.max(1, (progress?.levelProgress.nextLevelBaseXp ?? 120) - (progress?.levelProgress.currentLevelBaseXp ?? 0))) *
                    100
                )
              )}%`,
            }}
          />
        </div>
      </motion.div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Sticker Collection
          </h2>
          <span className="text-xs text-muted-foreground">
            {ownedStickers.length}/{stickers.length} owned
          </span>
        </div>

        {recentOwned.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stickers yet. Play games and complete missions to unlock your first batch.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentOwned.map((sticker) => (
              <div key={sticker.code} className="border border-border rounded-xl p-3 bg-slate-50">
                <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>
                  {sticker.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{sticker.batch}</div>
                <div className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs ${rarityClasses[sticker.rarity] || rarityClasses.COMMON}`}>
                  {sticker.rarity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarRange className="w-5 h-5 text-salami-green" />
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Active Event
          </h2>
        </div>

        {!eventData ? (
          <p className="text-sm text-muted-foreground">No active event right now. Seasonal missions will appear automatically.</p>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>
              {eventData.name} ({eventData.occasion})
            </div>
            {eventData.missions.map((mission) => (
              <div key={mission.missionId} className="border border-border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>{mission.title}</div>
                    <div className="text-xs text-muted-foreground">{mission.description}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mission.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {mission.completed ? "Completed" : `${mission.current}/${mission.target}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Wand2 className="w-5 h-5 text-salami-green" />
            AI Family Game Plan
          </h2>
          <button
            onClick={getAIPlan}
            disabled={aiLoading}
            className="px-4 py-2 text-sm rounded-xl bg-salami-green text-white hover:bg-salami-green-dark disabled:opacity-70"
          >
            {aiLoading ? "Thinking..." : "Generate"}
          </button>
        </div>

        {!recommendation ? (
          <p className="text-sm text-muted-foreground">Generate a family-safe recommendation powered by Longcat.</p>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>{recommendation.title}</div>
            <p className="text-sm text-muted-foreground">{recommendation.summary}</p>

            <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
              {recommendation.steps.map((step, idx) => (
                <li key={`step-${idx}`}>{step}</li>
              ))}
            </ul>

            {recommendation.missionIdeas?.length ? (
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-1">Suggested missions</div>
                <div className="flex flex-wrap gap-2">
                  {recommendation.missionIdeas.map((item, idx) => (
                    <span key={`mission-${idx}`} className="px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-salami-green to-emerald-500 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl text-foreground" style={{ fontWeight: 700 }}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
