import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { Avatar } from "@/shared/components/Avatar";
import { Trophy, Medal } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/utils";

interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatarUrl?: string;
  score: number;
  attempts?: number;
  averageAccuracy: number;
  rank: number;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
}

export const LeaderboardCard: FC<LeaderboardCardProps> = ({
  entries = [],
  currentUserId,
  title = "Leaderboard",
}) => {
  return (
    <Card className="p-5 space-y-4 transition-all duration-300 hover:shadow-md">
      <div>
        <h4 className="text-sm font-bold text-foreground leading-tight">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Top performing students in classroom</p>
      </div>

      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map((entry) => {
            const isMe = entry.studentId === currentUserId;

            return (
              <div
                key={entry.studentId}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all",
                  isMe
                    ? "bg-primary/10 border-primary/30 text-foreground scale-[1.01] shadow-sm font-bold"
                    : "bg-card border-border/70 hover:border-border"
                )}
              >
                {/* Rank indicator */}
                <div className="w-6 text-center text-xs font-black shrink-0">
                  {entry.rank === 1 ? (
                    <Trophy size={18} className="text-yellow-500 mx-auto" />
                  ) : entry.rank === 2 ? (
                    <Medal size={18} className="text-slate-400 mx-auto" />
                  ) : entry.rank === 3 ? (
                    <Medal size={18} className="text-amber-600 mx-auto" />
                  ) : (
                    <span>#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {entry.attempts ?? 0} attempts · {entry.averageAccuracy}% average accuracy
                  </p>
                </div>

                {/* Points score */}
                <span className="text-xs font-black text-primary font-mono shrink-0">
                  {entry.score} XP
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-muted-foreground p-5 text-center bg-secondary/15 border border-dashed border-border rounded-xl">
            No leaderboard activity recorded yet.
          </div>
        )}
      </div>
    </Card>
  );
};
