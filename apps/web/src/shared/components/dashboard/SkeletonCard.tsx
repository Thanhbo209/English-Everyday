import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { cn } from "@/shared/utils/utils";

interface SkeletonCardProps {
  type?: "stat" | "chart" | "list" | "card";
  className?: string;
}

export const SkeletonCard: FC<SkeletonCardProps> = ({
  type = "card",
  className,
}) => {
  return (
    <Card className={cn("p-5 space-y-4 animate-pulse border-border/80 bg-card", className)}>
      {type === "stat" && (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
        </div>
      )}

      {type === "chart" && (
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="h-[180px] w-full bg-muted/40 rounded-xl" />
        </div>
      )}

      {type === "list" && (
        <div className="space-y-3.5 w-full">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-36 bg-muted rounded" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-muted/40 rounded-xl flex items-center px-4 gap-3">
                <div className="w-6 h-6 rounded bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-muted rounded" />
                  <div className="h-2 w-40 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "card" && (
        <div className="space-y-3">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>
      )}
    </Card>
  );
};
