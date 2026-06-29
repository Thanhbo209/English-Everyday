import {
  ClipboardText,
  CheckCircle,
  Broadcast,
  Books,
  Plus,
} from "@phosphor-icons/react";
import type { RecentActivityItem } from "@/shared/hooks/useRecentActivities";

interface ActivityFeedProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse py-2">
        <div className="h-10 bg-secondary/15 rounded-lg" />
        <div className="h-10 bg-secondary/15 rounded-lg" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground">
        No recent activity in this classroom.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "ASSIGNMENT":
        return <ClipboardText size={14} className="text-orange-500" />;
      case "SUBMISSION":
        return <CheckCircle size={14} className="text-emerald-500" />;
      case "LIVE_SESSION":
        return <Broadcast size={14} className="text-purple-500" />;
      case "VOCAB_SET":
        return <Books size={14} className="text-blue-500" />;
      default:
        return <Plus size={14} className="text-muted-foreground" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "ASSIGNMENT":
        return "bg-orange-500/10 border-orange-500/20";
      case "SUBMISSION":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "LIVE_SESSION":
        return "bg-purple-500/10 border-purple-500/20";
      case "VOCAB_SET":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-secondary/15 border-border/80";
    }
  };

  return (
    <div className="relative border-l border-border/60 ml-3 pl-5 space-y-5 py-2 select-none text-[11px]">
      {activities.map((item) => {
        const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={item.id} className="relative group">
            {/* Timeline bullet dot wrapper */}
            <div className={`absolute -left-[30px] top-0.5 w-5 h-5 rounded-lg border flex items-center justify-center ${getBgColor(item.type)}`}>
              {getIcon(item.type)}
            </div>

            <div>
              <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{item.subtitle}</p>
              <span className="text-[9px] text-muted-foreground font-semibold mt-1 inline-block leading-none">
                {formattedDate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
