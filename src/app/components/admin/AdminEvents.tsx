import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminEvent } from "../../api";

export function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    slug: "",
    name: "",
    occasion: "",
    startAt: "",
    endAt: "",
    isActive: true,
  });

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await adminApi.getEvents();
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        toast.error(result.error || "Failed to load events");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await adminApi.createEvent({
        ...form,
        missions: [
          {
            missionId: "event-spin-10",
            title: "Spin Sprint",
            description: "Complete 10 spins in this event.",
            metric: "totalSpins",
            target: 10,
            rewardXp: 80,
          },
        ],
      });

      if (result.success) {
        toast.success("Event created");
        setForm({ slug: "", name: "", occasion: "", startAt: "", endAt: "", isActive: true });
        await loadEvents();
      } else {
        toast.error(result.error || "Failed to create event");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleEvent(event: AdminEvent) {
    const result = await adminApi.updateEvent(event.id, { isActive: !event.isActive });
    if (result.success) {
      toast.success(`Event ${!event.isActive ? "activated" : "paused"}`);
      await loadEvents();
    } else {
      toast.error(result.error || "Failed to update event");
    }
  }

  async function removeEvent(eventId: string) {
    const result = await adminApi.deleteEvent(eventId);
    if (result.success) {
      toast.success("Event deleted");
      await loadEvents();
    } else {
      toast.error(result.error || "Failed to delete event");
    }
  }

  const activeCount = useMemo(() => events.filter((event) => event.isActive).length, [events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
          Seasonal Events
        </h1>
        <p className="text-[0.875rem] text-muted-foreground">
          Manage Eid/Puja and custom event campaigns with missions and rare rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Total Events</div>
          <div className="text-2xl text-foreground" style={{ fontWeight: 700 }}>{events.length}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Active Events</div>
          <div className="text-2xl text-foreground" style={{ fontWeight: 700 }}>{activeCount}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Paused Events</div>
          <div className="text-2xl text-foreground" style={{ fontWeight: 700 }}>{Math.max(0, events.length - activeCount)}</div>
        </div>
      </div>

      <form onSubmit={createEvent} className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-foreground" style={{ fontWeight: 600 }}>
          <Plus className="w-5 h-5 text-salami-green" />
          Create Event
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug (eid-2026)"
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Event name"
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
          <input
            value={form.occasion}
            onChange={(e) => setForm((prev) => ({ ...prev, occasion: e.target.value }))}
            placeholder="Occasion"
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
          <div className="flex items-center gap-2 border border-border rounded-xl px-3">
            <input
              id="event-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="event-active" className="text-sm text-muted-foreground">Active</label>
          </div>
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
            className="px-3 py-2 rounded-xl border border-border"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a2e] text-white hover:bg-[#252545] disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Create Event
        </button>
      </form>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2 text-foreground" style={{ fontWeight: 600 }}>
          <CalendarDays className="w-5 h-5 text-salami-green" />
          Existing Events
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-salami-green" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No events found.</div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-foreground" style={{ fontWeight: 600 }}>{event.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.slug} · {event.occasion} · {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1.5 text-xs rounded-lg ${event.isActive ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {event.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
