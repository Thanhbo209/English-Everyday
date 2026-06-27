import { ArrowUp, ArrowDown, Minus } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

type TrendDir = "up" | "down" | "neutral";
type IconTone = "yellow" | "orange" | "green" | "blue";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconTone?: IconTone;
  trend?: { value: string; direction: TrendDir };
  description?: string;
  className?: string;
}

/* Maps tones to semantic token combos */
const iconTones: Record<IconTone, string> = {
  yellow: "bg-primary/10 text-primary",
  orange: "bg-chart-5/10 text-chart-5",
  green: "bg-chart-4/10 text-chart-4",
  blue: "bg-secondary/10 text-secondary",
};

const trendStyles: Record<TrendDir, string> = {
  up: "text-chart-4",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

function TrendIcon({ dir }: { dir: TrendDir }) {
  if (dir === "up") return <ArrowUp size={11} weight="bold" />;
  if (dir === "down") return <ArrowDown size={11} weight="bold" />;
  return <Minus size={11} weight="bold" />;
}

export function DashboardStatCard({
  label,
  value,
  icon,
  iconTone = "green",
  trend,
  description,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 shadow-sm",
        "hover:shadow-md transition-shadow duration-150",
        className,
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            iconTones[iconTone],
          )}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold",
              trendStyles[trend.direction],
            )}
          >
            <TrendIcon dir={trend.direction} />
            {trend.value}
          </span>
        )}
      </div>

      {/* Metric */}
      <p className="text-2xl font-bold text-foreground leading-tight tabular-nums">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      )}
    </div>
  );
}
