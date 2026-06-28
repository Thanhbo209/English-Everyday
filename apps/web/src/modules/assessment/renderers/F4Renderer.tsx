import type { FC } from "react";
import type { AssessmentQuestion } from "../types";
import { TextAnswerInput } from "../components/TextAnswerInput";
import { ScrambledHint } from "../components/ScrambledHint";

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const F4Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  onSubmit,
  disabled,
  hasAnswered,
  isCorrect,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="text-center py-2 space-y-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Type the scrambled word shown in the image:
        </span>
        <div className="max-w-xs mx-auto h-48 rounded-xl border border-border bg-sidebar overflow-hidden flex items-center justify-center p-2 shadow-sm">
          {question.prompt ? (
            <img
              src={question.prompt}
              alt="Prompt"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No image available</span>
          )}
        </div>
      </div>

      <ScrambledHint letters={question.scrambledHint || []} />

      <TextAnswerInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={disabled}
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
      />
    </div>
  );
};

export default F4Renderer;
