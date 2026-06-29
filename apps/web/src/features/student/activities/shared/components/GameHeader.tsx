import type { FC } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { GameProgress } from "./GameProgress";
import { GameTimer } from "./GameTimer";

interface GameHeaderProps {
  currentIndex: number;
  totalCards: number;
  secondsLeft: number;
  activityName: string;
  vocabSetTitle: string;
  onExit: () => void;
  showTimer?: boolean;
}

export const GameHeader: FC<GameHeaderProps> = ({
  currentIndex,
  totalCards,
  secondsLeft,
  activityName,
  vocabSetTitle,
  onExit,
  showTimer = true,
}) => {
  return (
    <div className="w-full space-y-4 pb-4 border-b border-border">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Exit</span>
        </button>

        <div className="text-center flex-1 min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate">
            {activityName}
          </h2>
          <p className="text-xs text-muted-foreground truncate font-medium">
            {vocabSetTitle}
          </p>
        </div>

        {showTimer && <GameTimer secondsLeft={secondsLeft} />}
      </div>

      <GameProgress currentIndex={currentIndex} totalCards={totalCards} />
    </div>
  );
};
