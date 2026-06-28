import type { FC } from "react";

interface ScrambledHintProps {
  letters: string[];
}

export const ScrambledHint: FC<ScrambledHintProps> = ({ letters }) => {
  if (!letters || letters.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Letter Hint
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {letters.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="w-8 h-8 rounded-lg border border-border bg-card shadow-sm flex items-center justify-center text-sm font-bold text-foreground select-none"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
