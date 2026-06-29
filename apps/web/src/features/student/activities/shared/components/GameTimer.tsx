import type { FC } from "react";
import { Timer } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/utils";

interface GameTimerProps {
  secondsLeft: number;
}

export const GameTimer: FC<GameTimerProps> = ({ secondsLeft }) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isUrgent = secondsLeft <= 10;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border transition-all duration-300",
        isUrgent
          ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
          : "bg-muted text-foreground border-border"
      )}
    >
      <Timer className="w-4 h-4" />
      <span className="tabular-nums">{formatTime(secondsLeft)}</span>
    </div>
  );
};
