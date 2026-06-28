import type { FC } from "react";
import { useEffect } from "react";
import { cn } from "../../../lib/utils";

interface MCQOptionsProps {
  options: string[];
  selectedChoice: string | null;
  onSelect: (choice: string) => void;
  disabled: boolean;
  correctAnswer?: string;
  hasAnswered?: boolean;
}

export const MCQOptions: FC<MCQOptionsProps> = ({
  options,
  selectedChoice,
  onSelect,
  disabled,
  correctAnswer,
  hasAnswered,
}) => {
  // Listen for keyboard hotkeys (1, 2, 3, 4)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === "1" || key === "2" || key === "3" || key === "4") {
        const index = parseInt(key) - 1;
        if (index < options.length) {
          onSelect(options[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [options, onSelect, disabled]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      {options.map((choice, index) => {
        const isImage = choice.startsWith("http") || choice.startsWith("/") || choice.includes("unsplash");
        const isSelected = selectedChoice === choice;
        const isCorrect = correctAnswer === choice;

        let borderClass = "border-border hover:border-primary/50 hover:bg-primary/5";
        let textClass = "text-foreground";
        let badgeClass = "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary";

        if (isSelected && !hasAnswered) {
          borderClass = "border-primary bg-primary/5 ring-1 ring-primary";
          badgeClass = "bg-primary text-primary-foreground";
        }

        if (hasAnswered) {
          if (isCorrect) {
            borderClass = "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500";
            textClass = "text-emerald-700 dark:text-emerald-400 font-semibold";
            badgeClass = "bg-emerald-500 text-white";
          } else if (isSelected) {
            borderClass = "border-destructive bg-destructive/10 dark:bg-destructive/20 ring-1 ring-destructive";
            textClass = "text-destructive font-semibold";
            badgeClass = "bg-destructive text-white";
          } else {
            borderClass = "border-border opacity-50";
            badgeClass = "bg-muted text-muted-foreground";
          }
        }

        return (
          <button
            key={choice}
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className={cn(
              "group relative flex items-center gap-3 p-4 rounded-xl border text-left font-medium transition-all duration-200 outline-none select-none",
              !disabled && "cursor-pointer active:scale-98",
              borderClass
            )}
          >
            {/* Hotkey Number Badge */}
            <span
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-colors shrink-0",
                badgeClass
              )}
            >
              {index + 1}
            </span>

            {/* Option Content: Image or Text */}
            {isImage ? (
              <div className="flex-1 h-32 rounded-lg border border-border bg-sidebar overflow-hidden flex items-center justify-center p-1">
                <img
                  src={choice}
                  alt={`Option ${index + 1}`}
                  className="max-h-full max-w-full object-contain rounded-md"
                  loading="lazy"
                />
              </div>
            ) : (
              <span className={cn("flex-1 text-sm leading-snug break-words", textClass)}>
                {choice}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
