import type { FC } from "react";
import { LoadingSpinner } from "@/shared/components";

export const LoadingGame: FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <span className="text-sm text-muted-foreground font-medium animate-pulse">
        Loading activity data...
      </span>
    </div>
  );
};
