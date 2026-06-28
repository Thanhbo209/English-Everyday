import type { FC } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { Button } from "@/shared/components";

interface QuestionFooterProps {
  hasAnswered: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
  disabledNext?: boolean;
}

export const QuestionFooter: FC<QuestionFooterProps> = ({
  hasAnswered,
  canSubmit,
  onSubmit,
  onNext,
  onSkip,
  isLast,
  disabledNext,
}) => {
  return (
    <div className="w-full py-4 border-t border-border flex items-center justify-between gap-4 mt-auto">
      {/* Left side: Skip button if not answered */}
      {!hasAnswered ? (
        <Button
          onClick={onSkip}
          variant="ghost"
          size="md"
          className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        >
          Skip Question
        </Button>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right side: Action button */}
      {!hasAnswered ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          variant="primary"
          size="md"
          leftIcon={<Check size={18} />}
          className="cursor-pointer font-bold px-6 shrink-0"
        >
          Check Answer
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={disabledNext}
          variant="secondary"
          size="md"
          className="cursor-pointer font-bold px-6 shrink-0 bg-primary text-primary-foreground hover:bg-primary/95"
        >
          <span className="flex items-center gap-2">
            {isLast ? "Finish Assessment" : "Next Question"}
            <ArrowRight size={18} />
          </span>
        </Button>
      )}
    </div>
  );
};
