import type { FC } from "react";
import { ArrowLeft, ArrowRight, Play, Pause } from "@phosphor-icons/react";
import { Button } from "@/shared/components";

interface FlashcardControlsProps {
  onNext: () => void;
  onPrev: () => void;
  disabledNext?: boolean;
  disabledPrev?: boolean;
  showAutoPlay?: boolean;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
}

export const FlashcardControls: FC<FlashcardControlsProps> = ({
  onNext,
  onPrev,
  disabledNext = false,
  disabledPrev = false,
  showAutoPlay = false,
  isPlaying = false,
  onPlayToggle,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto select-none pt-4">
      {/* Prev button */}
      <Button
        variant="outline"
        size="sm"
        className="p-3.5 h-11 w-11 rounded-full flex items-center justify-center shrink-0 border border-border/80"
        leftIcon={<ArrowLeft size={16} />}
        disabled={disabledPrev}
        onClick={onPrev}
        aria-label="Previous card"
      />

      {/* Auto play toggle (Play / Pause button in center, for A1) */}
      {showAutoPlay && onPlayToggle && (
        <button
          onClick={onPlayToggle}
          className="h-11 px-5 rounded-full inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-wide border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition-all shadow-sm"
          aria-label={isPlaying ? "Pause auto play" : "Start auto play"}
        >
          {isPlaying ? (
            <>
              <Pause size={16} weight="fill" />
              Pause
            </>
          ) : (
            <>
              <Play size={16} weight="fill" />
              Play
            </>
          )}
        </button>
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        className="p-3.5 h-11 w-11 rounded-full flex items-center justify-center shrink-0 border border-border/80"
        leftIcon={<ArrowRight size={16} />}
        disabled={disabledNext}
        onClick={onNext}
        aria-label="Next card"
      />
    </div>
  );
};
