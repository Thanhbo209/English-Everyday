import type { FC, ReactNode } from "react";
import { Card } from "@/shared/components/Card";
import { cn } from "@/shared/utils/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconTone?: "yellow" | "blue" | "green" | "orange" | "purple" | "red";
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconTone = "blue",
  description,
  trend,
}) => {
  const toneClasses = {
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    red: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Card className="flex items-center gap-4.5 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", toneClasses[iconTone])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight tabular-nums">
          {value}
        </h3>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs font-bold">
            <span className={trend.isPositive ? "text-emerald-500" : "text-destructive"}>
              {trend.value}
            </span>
            <span className="text-muted-foreground font-medium">vs last week</span>
          </div>
        )}
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">{description}</p>
        )}
      </div>
    </Card>
  );
};
