import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { cn } from "@/shared/utils/utils";

interface ProgressCardProps {
  title: string;
  subtitle?: string;
  known: number;
  learning: number;
  newCount: number;
  total: number;
  percentages: {
    known: number;
    learning: number;
    new: number;
  };
  onClick?: () => void;
}

export const ProgressCard: FC<ProgressCardProps> = ({
  title,
  subtitle,
  known,
  learning,
  newCount,
  total,
  percentages,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 space-y-4 transition-all duration-300 hover:shadow-md",
        onClick && "cursor-pointer hover:scale-[1.01]"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground leading-tight truncate">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full select-none shrink-0">
          {percentages.known}% Mastery
        </span>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-3 gap-2 text-center py-1">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2">
          <p className="text-lg font-extrabold text-emerald-600 leading-none">{known}</p>
          <p className="text-[10px] uppercase font-bold text-emerald-500/70 mt-1">Known</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-2">
          <p className="text-lg font-extrabold text-amber-600 leading-none">{learning}</p>
          <p className="text-[10px] uppercase font-bold text-amber-500/70 mt-1">Learning</p>
        </div>
        <div className="bg-muted border border-border/50 rounded-xl p-2">
          <p className="text-lg font-extrabold text-foreground leading-none">{newCount}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">New</p>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="space-y-1">
        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percentages.known}%` }}
            title={`Known: ${percentages.known}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${percentages.learning}%` }}
            title={`Learning: ${percentages.learning}%`}
          />
          <div
            className="h-full bg-muted transition-all duration-500"
            style={{ width: `${percentages.new}%` }}
            title={`New: ${percentages.new}%`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
          <span>{total} total items</span>
          <span>{percentages.known}% Known</span>
        </div>
      </div>
    </Card>
  );
};
