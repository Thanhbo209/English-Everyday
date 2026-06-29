import type { FC } from "react";
import { Card } from "@/shared/components/Card";

interface ChartCardProps {
  title: string;
  description?: string;
  type: "score" | "accuracy" | "history";
  dataPoints: Array<{
    date: string;
    value: number;
    secondaryValue?: number;
  }>;
}

export const ChartCard: FC<ChartCardProps> = ({
  title,
  description,
  type: _type,
  dataPoints = [],
}) => {
  // If no data points, show simple placeholder graph
  const points = dataPoints.length > 0 ? dataPoints : [
    { date: "Day 1", value: 0 },
    { date: "Day 2", value: 0 },
  ];

  const maxVal = Math.max(...points.map(p => p.value), 100);
  const minVal = 0;
  const range = maxVal - minVal;

  // SVG scaling dimensions
  const width = 500;
  const height = 200;
  const padding = 20;

  // Map values to coordinates
  const coordinates = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((p.value - minVal) / range) * (height - padding * 2);
    return { x, y, ...p };
  });

  // SVG path for line
  const pathD = coordinates.reduce((acc, coord, idx) => {
    if (idx === 0) return `M ${coord.x} ${coord.y}`;
    return `${acc} L ${coord.x} ${coord.y}`;
  }, "");

  // Area path for gradient fill
  const areaD = coordinates.length > 0
    ? `${pathD} L ${coordinates[coordinates.length - 1].x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`
    : "";

  return (
    <Card className="p-5 space-y-4 transition-all duration-300 hover:shadow-md">
      <div>
        <h4 className="text-sm font-bold text-foreground leading-tight">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>

      <div className="relative w-full h-[200px] bg-secondary/5 border border-border/30 rounded-xl overflow-hidden p-2">
        {points.length > 1 ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-border)" strokeWidth={1} />

            {/* Gradient Area under line */}
            <path d={areaD} fill="url(#chartGrad)" />

            {/* Main Path Line */}
            <path d={pathD} fill="none" stroke="var(--color-primary, #6366f1)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive dots */}
            {coordinates.map((coord, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={coord.x} cy={coord.y} r={4.5} fill="var(--color-card)" stroke="var(--color-primary, #6366f1)" strokeWidth={2.5} />
                <circle cx={coord.x} cy={coord.y} r={8} fill="var(--color-primary, #6366f1)" fillOpacity="0.0" className="hover:fill-opacity-15" />
              </g>
            ))}
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Not enough data points yet.
          </div>
        )}
      </div>

      {/* Footer labels */}
      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold px-1">
        <span>{points[0]?.date || "Start"}</span>
        <span>{points[points.length - 1]?.date || "End"}</span>
      </div>
    </Card>
  );
};
