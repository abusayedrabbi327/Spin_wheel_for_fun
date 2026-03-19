import AIUsage from "../_models/AIUsage.js";

const LONGCAT_OPENAI_BASE = process.env.LONGCAT_OPENAI_BASE || "https://api.longcat.chat/openai";
const LONGCAT_MODEL = process.env.LONGCAT_MODEL || "LongCat-Flash-Chat";
const LONGCAT_API_KEY = process.env.LONGCAT_API_KEY || "";
const DAILY_TOKEN_LIMIT = parseInt(process.env.LONGCAT_DAILY_TOKEN_LIMIT || "100000", 10);

function estimateTokenUsage(text: string): number {
  return Math.max(30, Math.ceil(text.length / 4));
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function reserveEstimatedTokens(tokens: number) {
  const key = dayKey();
  const usage = await AIUsage.findOneAndUpdate(
    { dateKey: key },
    { $setOnInsert: { dateKey: key, tokensUsed: 0, requestCount: 0 } },
    { new: true, upsert: true }
  );

  if (usage.tokensUsed + tokens > DAILY_TOKEN_LIMIT) {
    throw new Error("Daily AI quota reached. Please try again tomorrow.");
  }

  usage.tokensUsed += tokens;
  usage.requestCount += 1;
  await usage.save();
}

export async function generateFamilySafeRecommendation(input: {
  mood: string;
  groupSize: number;
  occasion?: string;
  durationMinutes?: number;
  hasKids?: boolean;
  prompt?: string;
  area?: string;
}) {
  if (!LONGCAT_API_KEY) {
    throw new Error("LONGCAT_API_KEY is not configured");
  }

  const userPrompt = [
    "Give one game recommendation for a social wheel app.",
    `Mood: ${input.mood}.`,
    `Group size: ${input.groupSize}.`,
    `Occasion: ${input.occasion || "general"}.`,
    `Duration: ${input.durationMinutes || 20} minutes.`,
    `Kids present: ${input.hasKids ? "yes" : "no"}.`,
    input.area ? `Preferred area/region context: ${input.area}.` : "",
    input.prompt ? `Extra user request: ${input.prompt}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const systemPrompt = [
    "You are a family-safe game planner.",
    "Return strict JSON only with keys: title, summary, steps, safetyNotes, missionIdeas.",
    "Keep content suitable for mixed-age family and friends.",
    "Avoid unsafe, explicit, hateful, harmful, gambling, or adult themes.",
    "Keep steps concise and practical.",
  ].join(" ");

  const estimated = estimateTokenUsage(systemPrompt + userPrompt) + 600;
  await reserveEstimatedTokens(estimated);

  const response = await fetch(`${LONGCAT_OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LONGCAT_API_KEY}`,
    },
    body: JSON.stringify({
      model: LONGCAT_MODEL,
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Longcat API request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Longcat response did not include content");
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      title: "Quick Family Challenge",
      summary: "Play two fast rounds and rotate the winner as host.",
      steps: ["Set timer for 15 minutes", "Spin for first mini game", "Award friendly points", "Celebrate top scorer"],
      safetyNotes: ["Keep prompts respectful", "Use kid-friendly options if children are present"],
      missionIdeas: ["Complete 5 spins", "Invite one friend"],
    };
  }
}
