import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Swords, Trophy, UserPlus, CheckCircle2, XCircle, Flag } from "lucide-react";
import { toast } from "sonner";
import { challengesApi, leaderboardApi, type FriendChallenge, type LeaderboardEntry } from "../../api";
import { getAuthState } from "../../auth";

export function ChallengesPage() {
  const me = getAuthState();
  const myEmail = (me?.user?.email || me?.email || "").toLowerCase();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [opponentEmail, setOpponentEmail] = useState("");
  const [title, setTitle] = useState("Weekend Friendly Battle");
  const [description, setDescription] = useState("Highest spin score wins this challenge.");

  async function loadData() {
    setLoading(true);
    try {
      const [lb, ch] = await Promise.all([leaderboardApi.list(20), challengesApi.list()]);
      if (lb.success && lb.data) setLeaderboard(lb.data);
      if (ch.success && ch.data) setChallenges(ch.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const incomingPending = useMemo(
    () => challenges.filter((challenge) => challenge.status === "PENDING" && challenge.opponent.email?.toLowerCase() === myEmail),
    [challenges, myEmail]
  );

  async function submitChallenge(e: FormEvent) {
    e.preventDefault();
    if (!opponentEmail || !title) return;

    const result = await challengesApi.create({
      opponentEmail,
      title,
      description,
      expiresInDays: 7,
    });

    if (result.success) {
      toast.success("Challenge sent");
      setOpponentEmail("");
      await loadData();
    } else {
      toast.error(result.error || "Failed to create challenge");
    }
  }

  async function respond(challengeId: string, action: "accept" | "decline") {
    const result = await challengesApi.update(challengeId, { action });
    if (result.success) {
      toast.success(action === "accept" ? "Challenge accepted" : "Challenge declined");
      await loadData();
    } else {
      toast.error(result.error || "Failed to update challenge");
    }
  }

  async function completeChallenge(challenge: FriendChallenge) {
    const creatorScore = Number(window.prompt("Creator score:", String(challenge.creator.score || 0)) || 0);
    const opponentScore = Number(window.prompt("Opponent score:", String(challenge.opponent.score || 0)) || 0);

    const result = await challengesApi.update(challenge.id, {
      action: "complete",
      creatorScore,
      opponentScore,
    });

    if (result.success) {
      toast.success("Challenge completed");
      await loadData();
    } else {
      toast.error(result.error || "Failed to complete challenge");
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
          Leaderboard and Friend Challenges
        </h1>
        <p className="text-[0.875rem] text-muted-foreground">Compete with friends and climb the leaderboard.</p>
      </div>

      <form onSubmit={submitChallenge} className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-foreground" style={{ fontWeight: 600 }}>
          <UserPlus className="w-5 h-5 text-salami-green" />
          Challenge a Friend
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="email"
            value={opponentEmail}
            onChange={(e) => setOpponentEmail(e.target.value)}
            placeholder="friend@example.com"
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Challenge title"
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-border"
          placeholder="Description"
        />
        <button type="submit" className="px-4 py-2 rounded-xl bg-salami-green text-white hover:bg-salami-green-dark">
          Send Challenge
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 text-foreground" style={{ fontWeight: 600 }}>
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Players
          </div>
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {leaderboard.map((entry) => (
              <div key={entry.userId} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>#{entry.rank} {entry.name}</div>
                  <div className="text-xs text-muted-foreground">Lvl {entry.level} · Streak {entry.streakDays}d</div>
                </div>
                <div className="text-sm text-salami-green" style={{ fontWeight: 700 }}>{entry.xp} XP</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 text-foreground" style={{ fontWeight: 600 }}>
            <Swords className="w-5 h-5 text-sky-500" />
            Challenges
          </div>
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {challenges.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No challenges yet.</div>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>{challenge.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {challenge.creator.name} vs {challenge.opponent.name}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{challenge.status}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Score: {challenge.creator.score} - {challenge.opponent.score}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {incomingPending.some((item) => item.id === challenge.id) ? (
                      <>
                        <button onClick={() => respond(challenge.id, "accept")} className="px-2 py-1 text-xs rounded-lg bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => respond(challenge.id, "decline")} className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Decline
                        </button>
                      </>
                    ) : null}

                    {challenge.status === "ACCEPTED" ? (
                      <button onClick={() => completeChallenge(challenge)} className="px-2 py-1 text-xs rounded-lg bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Complete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
