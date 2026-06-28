import type { FC } from "react";
import type { AssessmentQuestion } from "../types";
import { MCQOptions } from "../components/MCQOptions";

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const Q4Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  disabled,
  hasAnswered,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="text-center py-4 max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Which word matches this meaning?
        </span>
        <blockquote className="text-lg font-semibold text-foreground italic border-l-4 border-primary/20 pl-4 py-1 text-left bg-secondary/10 rounded-r-lg">
          "{question.prompt}"
        </blockquote>
      </div>

      <MCQOptions
        options={question.options || []}
        selectedChoice={value || null}
        onSelect={onChange}
        disabled={disabled}
        correctAnswer={question.correctAnswer}
        hasAnswered={hasAnswered}
      />
    </div>
  );
};

export default Q4Renderer;
