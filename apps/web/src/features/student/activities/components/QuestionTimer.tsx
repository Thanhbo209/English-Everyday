import type { FC } from "react";
import { Clock } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/utils";

interface QuestionTimerProps {
  secondsLeft: number;
}

export const QuestionTimer: FC<QuestionTimerProps> = ({
  secondsLeft,
}) => {
  const isLow = secondsLeft <= 5;
  const isCritical = secondsLeft <= 3;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 shadow-sm shrink-0",
        isCritical
          ? "bg-red-500/10 border-red-500/30 text-red-600 animate-pulse scale-105"
          : isLow
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 scale-102"
            : "bg-primary/5 border-primary/20 text-primary"
      )}
    >
      <Clock size={15} weight={isLow ? "fill" : "regular"} className="shrink-0" />
      <span>{secondsLeft}s left</span>
    </div>
  );
};
