import type { FC } from "react";
import { Button } from "@/shared/components";
import { ArrowRight, SkipForward } from "@phosphor-icons/react";

interface GameFooterProps {
  hasAnswered: boolean;
  onNext: () => void;
  onSkip?: () => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  submitText?: string;
  isLast?: boolean;
}

export const GameFooter: FC<GameFooterProps> = ({
  hasAnswered,
  onNext,
  onSkip,
  onSubmit,
  submitDisabled = false,
  submitText = "Check Answer",
  isLast = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-border mt-auto">
      {onSkip && !hasAnswered ? (
        <Button variant="ghost" onClick={onSkip} className="gap-1.5 cursor-pointer">
          <SkipForward size={16} />
          <span>Skip</span>
        </Button>
      ) : (
        <div />
      )}

      {hasAnswered ? (
        <Button onClick={onNext} className="gap-1.5 cursor-pointer">
          <span>{isLast ? "Finish" : "Next"}</span>
          <ArrowRight size={16} />
        </Button>
      ) : (
        onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={submitDisabled}
            className="cursor-pointer"
          >
            {submitText}
          </Button>
        )
      )}
    </div>
  );
};
