import type { FC } from "react";
import { Button } from "@/shared/components";
import { WarningCircle } from "@phosphor-icons/react";

interface EmptyGameProps {
  message?: string;
  onExit: () => void;
}

export const EmptyGame: FC<EmptyGameProps> = ({
  message = "This activity has no available vocabulary items.",
  onExit,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto gap-6 min-h-[400px]">
      <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
        <WarningCircle size={48} />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-foreground">Activity Empty</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>

      <Button onClick={onExit} variant="ghost" className="w-full cursor-pointer">
        Go Back to Dashboard
      </Button>
    </div>
  );
};
