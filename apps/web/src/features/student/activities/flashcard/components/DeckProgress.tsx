import type { FC } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/shared/components";

interface DeckProgressProps {
  currentIndex: number;
  totalCards: number;
  activityName: string;
  vocabSetTitle: string;
  onBackClick?: () => void;
}

export const DeckProgress: FC<DeckProgressProps> = ({
  currentIndex,
  totalCards,
  activityName,
  vocabSetTitle,
  onBackClick,
}) => {
  const displayIndex = totalCards > 0 ? currentIndex + 1 : 0;
  const progressPercent = totalCards > 0 ? (displayIndex / totalCards) * 100 : 0;

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto select-none">
      {/* Upper row: Back btn & Info */}
      <div className="flex items-center justify-between gap-4">
        {onBackClick && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={onBackClick}
          >
            Exit
          </Button>
        )}

        <div className="text-right">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {activityName}
          </h4>
          <h2 className="text-sm font-bold text-foreground line-clamp-1">
            {vocabSetTitle}
          </h2>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-muted-foreground">
            Card <strong className="text-foreground">{displayIndex}</strong> of{" "}
            <strong>{totalCards}</strong>
          </span>
          <span className="text-primary font-mono">{Math.round(progressPercent)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/10">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
