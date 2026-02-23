import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Plus,
  Eye,
  Users,
  Trophy,
  Clock,
  MoreVertical,
  CircleDot,
  Loader2,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { wheelsApi, type Wheel } from "../../api";

export function MyWheels() {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadWheels();
  }, []);

  const loadWheels = async () => {
    setLoading(true);
    try {
      const result = await wheelsApi.list();
      if (result.success && result.data) {
        setWheels(result.data);
      } else {
        toast.error(result.error || "Failed to load wheels");
      }
    } catch (error) {
      console.error("Load wheels error:", error);
      toast.error("Failed to load wheels");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wheel?")) return;
    
    setDeletingId(id);
    try {
      const result = await wheelsApi.delete(id);
      if (result.success) {
        setWheels(wheels.filter(w => w.id !== id));
        toast.success("Wheel deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete wheel");
      }
    } catch (error) {
      toast.error("Failed to delete wheel");
    } finally {
      setDeletingId(null);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/spin/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-salami-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            My Wheels
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            Manage all your spin wheel campaigns
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-sm"
          style={{ fontWeight: 500 }}
        >
          <Plus className="w-5 h-5" />
          New Wheel
        </Link>
      </div>

      {wheels.length === 0 ? (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-salami-green-light flex items-center justify-center mx-auto mb-4">
            <CircleDot className="w-8 h-8 text-salami-green" />
          </div>
          <h3 className="text-foreground text-lg font-semibold mb-2">No wheels yet</h3>
          <p className="text-muted-foreground mb-6">Create your first spin wheel to get started!</p>
          <Link
            to="/dashboard/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all"
            style={{ fontWeight: 500 }}
          >
            <Plus className="w-5 h-5" />
            Create Wheel
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {wheels.map((wheel, i) => (
            <motion.div
              key={wheel.id}
              className="bg-white rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-salami-green/20 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        wheel.isActive
                          ? "bg-salami-green-light"
                          : "bg-gray-100"
                      }`}
                    >
                      <CircleDot
                        className={`w-5 h-5 ${
                          wheel.isActive
                            ? "text-salami-green"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-foreground text-[0.9375rem] font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
                        {wheel.title}
                      </h3>
                      <span
                        className={`inline-flex text-[0.75rem] ${
                          wheel.isActive
                            ? "text-salami-green"
                            : "text-gray-400"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {wheel.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(wheel.id)}
                    disabled={deletingId === wheel.id}
                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {deletingId === wheel.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-input-background">
                    <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 600 }}>
                      {wheel._count?.spins || 0}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      Spins
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-input-background">
                    <Trophy className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 600 }}>
                      {wheel.items?.length || 0}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      Items
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-input-background">
                    <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-foreground text-[0.75rem]" style={{ fontWeight: 600 }}>
                      {wheel.expiryDate 
                        ? formatDate(wheel.expiryDate).split(",")[0]
                        : "∞"
                      }
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      {wheel.expiryDate ? "Expires" : "No Expiry"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(wheel.slug)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-[0.875rem] text-foreground hover:border-salami-green hover:text-salami-green transition-all"
                    style={{ fontWeight: 500 }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <Link
                    to={`/spin/${wheel.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-salami-green text-white rounded-xl text-[0.875rem] hover:bg-salami-green-dark transition-all"
                    style={{ fontWeight: 500 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}