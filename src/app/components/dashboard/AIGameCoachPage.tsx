import { useMemo, useState } from "react";
import { Bot, Loader2, MapPinned, Send, Sparkles } from "lucide-react";
import { aiApi, type AIRecommendation } from "../../api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendation?: AIRecommendation;
};

function formatRecommendation(rec: AIRecommendation): string {
  const steps = rec.steps?.length ? rec.steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n") : "";
  const missions = rec.missionIdeas?.length ? `\nMission ideas: ${rec.missionIdeas.join(", ")}` : "";
  return `${rec.title}\n${rec.summary}${steps ? `\n\nSteps:\n${steps}` : ""}${missions}`;
}

export function AIGameCoachPage() {
  const [prompt, setPrompt] = useState("");
  const [area, setArea] = useState("Dhaka");
  const [groupSize, setGroupSize] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [hasKids, setHasKids] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Tell me your mood, group type, and location. I will suggest better game plans, new game ideas, and area-wise activities.",
    },
  ]);

  const canSend = useMemo(() => prompt.trim().length >= 3 && !sending, [prompt, sending]);

  async function sendMessage() {
    const message = prompt.trim();
    if (!message || sending) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setSending(true);

    try {
      const result = await aiApi.chat({
        prompt: message,
        mood: "playful and family-safe",
        groupSize,
        occasion: "social gathering",
        durationMinutes,
        hasKids,
        area,
      });

      if (!result.success || !result.data?.recommendation) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: result.error || "AI could not generate a plan right now. Please try again.",
          },
        ]);
        return;
      }

      const recommendation = result.data.recommendation;
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: formatRecommendation(recommendation),
          recommendation,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          AI Game Coach
        </h1>
        <p className="text-[0.875rem] text-muted-foreground mt-1">
          Chat with Longcat for better game plans, new ideas, and area-wise suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="text-sm text-muted-foreground">
          Area/Region
          <div className="mt-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-white">
            <MapPinned className="w-4 h-4 text-salami-green" />
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground"
              placeholder="City or area"
            />
          </div>
        </label>

        <label className="text-sm text-muted-foreground">
          Group Size
          <input
            type="number"
            min={1}
            max={50}
            value={groupSize}
            onChange={(e) => setGroupSize(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            className="mt-1 w-full border border-border rounded-xl px-3 py-2 bg-white text-foreground outline-none"
          />
        </label>

        <label className="text-sm text-muted-foreground">
          Duration (min)
          <input
            type="number"
            min={5}
            max={180}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 5)))}
            className="mt-1 w-full border border-border rounded-xl px-3 py-2 bg-white text-foreground outline-none"
          />
        </label>

        <label className="text-sm text-muted-foreground flex items-end pb-2">
          <span className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasKids}
              onChange={(e) => setHasKids(e.target.checked)}
              className="w-4 h-4"
            />
            Kids Friendly
          </span>
        </label>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Bot className="w-5 h-5 text-salami-green" />
          <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>Game Plan Chat</span>
        </div>

        <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm ${
                message.role === "user"
                  ? "ml-auto bg-salami-green text-white"
                  : "bg-white border border-border text-foreground"
              }`}
            >
              {message.role === "assistant" && (
                <div className="text-xs text-salami-green mb-1 inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
                  <Sparkles className="w-3.5 h-3.5" /> AI Coach
                </div>
              )}
              {message.text}
            </div>
          ))}
          {sending && (
            <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-white border border-border text-foreground inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-salami-green" />
              Thinking...
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-white">
          <div className="flex items-center gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSend) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask: suggest a Bengali family game for rainy day in Dhaka..."
              className="flex-1 border border-border rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-salami-green text-white hover:bg-salami-green-dark disabled:opacity-60"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
