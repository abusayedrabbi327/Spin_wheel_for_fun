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
} from "lucide-react";

const campaigns = [
  {
    id: "1",
    name: "Friday Lunch - Who Pays?",
    status: "Active",
    participants: 45,
    winners: 12,
    maxWinners: 20,
    expiry: "Mar 15, 2026",
    created: "Feb 18, 2026",
  },
  {
    id: "2",
    name: "Team Giveaway Raffle",
    status: "Active",
    participants: 28,
    winners: 8,
    maxWinners: 15,
    expiry: "Mar 10, 2026",
    created: "Feb 15, 2026",
  },
  {
    id: "3",
    name: "Classroom Random Picker",
    status: "Closed",
    participants: 67,
    winners: 20,
    maxWinners: 20,
    expiry: "Feb 20, 2026",
    created: "Feb 10, 2026",
  },
  {
    id: "4",
    name: "Birthday Party Prize Wheel",
    status: "Active",
    participants: 34,
    winners: 10,
    maxWinners: 25,
    expiry: "Mar 20, 2026",
    created: "Feb 8, 2026",
  },
  {
    id: "5",
    name: "Holiday Gift Exchange",
    status: "Closed",
    participants: 89,
    winners: 30,
    maxWinners: 30,
    expiry: "Feb 5, 2026",
    created: "Jan 28, 2026",
  },
  {
    id: "6",
    name: "Office Tip Pool",
    status: "Active",
    participants: 15,
    winners: 3,
    maxWinners: 10,
    expiry: "Mar 25, 2026",
    created: "Feb 22, 2026",
  },
];

export function MyWheels() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {campaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
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
                      campaign.status === "Active"
                        ? "bg-salami-green-light"
                        : "bg-gray-100"
                    }`}
                  >
                    <CircleDot
                      className={`w-5 h-5 ${
                        campaign.status === "Active"
                          ? "text-salami-green"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[0.9375rem] font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
                      {campaign.name}
                    </h3>
                    <span
                      className={`inline-flex text-[0.75rem] ${
                        campaign.status === "Active"
                          ? "text-salami-green"
                          : "text-gray-400"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-input-background">
                  <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 600 }}>
                    {campaign.participants}
                  </div>
                  <div className="text-[0.625rem] text-muted-foreground">
                    Spins
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-input-background">
                  <Trophy className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 600 }}>
                    {campaign.winners}/{campaign.maxWinners}
                  </div>
                  <div className="text-[0.625rem] text-muted-foreground">
                    Winners
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-input-background">
                  <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-foreground text-[0.75rem]" style={{ fontWeight: 600 }}>
                    {campaign.expiry.split(",")[0]}
                  </div>
                  <div className="text-[0.625rem] text-muted-foreground">
                    Expires
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[0.75rem] text-muted-foreground mb-1">
                  <span>Winner slots used</span>
                  <span>
                    {Math.round(
                      (campaign.winners / campaign.maxWinners) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-input-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-salami-green to-salami-gold rounded-full transition-all"
                    style={{
                      width: `${(campaign.winners / campaign.maxWinners) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <Link
                to={`/dashboard/campaign/${campaign.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-xl text-[0.875rem] text-foreground hover:border-salami-green hover:text-salami-green transition-all"
                style={{ fontWeight: 500 }}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}