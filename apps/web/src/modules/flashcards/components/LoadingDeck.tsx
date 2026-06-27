import type { FC } from "react";
import { LoadingSpinner } from "../../../components/ui";

export const LoadingDeck: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] select-none gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground animate-pulse font-medium">
        Loading vocabulary deck...
      </p>
    </div>
  );
};
