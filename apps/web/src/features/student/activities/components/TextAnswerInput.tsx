import type { FC } from "react";
import { useEffect, useRef } from "react";
import { Input } from "@/shared/components";
import { cn } from "@/shared/utils/utils";

interface TextAnswerInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  hasAnswered?: boolean;
  isCorrect?: boolean;
}

export const TextAnswerInput: FC<TextAnswerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type your answer here...",
  hasAnswered,
  isCorrect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full text-center text-lg font-semibold py-6 rounded-xl border transition-all duration-200 outline-none",
            hasAnswered
              ? isCorrect
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                : "border-destructive bg-destructive/10 text-destructive font-bold"
              : "border-border focus:border-primary/50 focus:ring-1 focus:ring-primary"
          )}
          autoComplete="off"
          autoFocus
        />
      </div>
      {!hasAnswered && (
        <p className="text-center text-xs text-muted-foreground animate-pulse">
          Press <strong className="text-foreground">Enter</strong> to submit
        </p>
      )}
    </div>
  );
};
