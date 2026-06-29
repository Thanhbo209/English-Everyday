import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { cn } from "@/shared/utils/utils";

interface ActivityTimelineItem {
  id: string;
  type: "SUBMISSION" | "ASSIGNMENT" | "LIVE_SESSION" | "VOCAB_SET";
  title: string;
  subtitle: string;
  timestamp: string;
}

interface RecentActivityCardProps {
  activities: ActivityTimelineItem[];
  title?: string;
}

export const RecentActivityCard: FC<RecentActivityCardProps> = ({
  activities = [],
  title = "Recent Activity",
}) => {
  const getTimelineIconColor = (type: string) => {
    if (type === "SUBMISSION") return "bg-emerald-500 ring-emerald-500/20";
    if (type === "ASSIGNMENT") return "bg-blue-500 ring-blue-500/20";
    if (type === "LIVE_SESSION") return "bg-purple-500 ring-purple-500/20";
    return "bg-amber-500 ring-amber-500/20";
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="p-5 space-y-4 transition-all duration-300 hover:shadow-md">
      <div>
        <h4 className="text-sm font-bold text-foreground leading-tight">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Timeline of recent events and updates</p>
      </div>

      {activities.length > 0 ? (
        <div className="relative border-l border-border/80 pl-6 ml-3 space-y-5 py-1">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Timeline indicator node */}
              <div
                className={cn(
                  "absolute left-[-30px] top-1 w-3 h-3 rounded-full ring-4 transition-all",
                  getTimelineIconColor(act.type)
                )}
              />
              <div>
                <p className="text-xs font-bold text-foreground leading-snug">{act.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{act.subtitle}</p>
                <span className="text-[9px] text-muted-foreground/80 font-semibold mt-1 block">
                  {formatTimestamp(act.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground p-5 text-center bg-secondary/15 border border-dashed border-border rounded-xl">
          No recent activity logs found.
        </div>
      )}
    </Card>
  );
};
