import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { cn } from "@/shared/utils/utils";

interface HeatmapItem {
  id: string;
  term: string;
  status: "KNOWN" | "LEARNING" | "NEW";
  attempts: number;
}

interface HeatmapCardProps {
  title: string;
  subtitle?: string;
  items: HeatmapItem[];
}

export const HeatmapCard: FC<HeatmapCardProps> = ({
  title,
  subtitle = "Hover over squares to see vocabulary details",
  items = [],
}) => {
  const getStatusColor = (status: "KNOWN" | "LEARNING" | "NEW") => {
    if (status === "KNOWN") return "bg-emerald-500 hover:bg-emerald-600";
    if (status === "LEARNING") return "bg-amber-500 hover:bg-amber-600";
    return "bg-muted hover:bg-border";
  };

  return (
    <Card className="p-5 space-y-4 transition-all duration-300 hover:shadow-md">
      <div>
        <h4 className="text-sm font-bold text-foreground leading-tight">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1 p-1 border border-border/40 rounded-xl bg-secondary/5">
            {items.map((item) => (
              <div
                key={item.id}
                title={`${item.term || "Word"} (${(item.status || "NEW").toLowerCase()} · ${item.attempts ?? 0} attempts)`}
                className={cn(
                  "w-7 h-7 rounded-lg transition-colors cursor-help flex items-center justify-center text-[10px] font-black text-white select-none",
                  getStatusColor(item.status)
                )}
              >
                {(item.term || "").slice(0, 1).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-end gap-4 text-[10px] text-muted-foreground font-bold pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
              <span>Known</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-amber-500" />
              <span>Learning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-muted" />
              <span>New</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground p-5 text-center bg-secondary/15 border border-dashed border-border rounded-xl">
          No vocabulary mastery data available.
        </div>
      )}
    </Card>
  );
};
