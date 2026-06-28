import type { FC } from "react";
import type { AssessmentQuestion } from "../types";
import { TextAnswerInput } from "../components/TextAnswerInput";

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const F2Renderer: FC<RendererProps> = ({
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
      <div className="text-center py-4 max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Type the word matching this definition:
        </span>
        <blockquote className="text-lg font-semibold text-foreground italic border-l-4 border-primary/20 pl-4 py-1 text-left bg-secondary/10 rounded-r-lg">
          "{question.prompt}"
        </blockquote>
      </div>

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

export default F2Renderer;
