import type { FC } from "react";
import { LoadingSpinner } from "@/shared/components";

export const LoadingQuestion: FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Generating assessment questions...
      </p>
    </div>
  );
};
