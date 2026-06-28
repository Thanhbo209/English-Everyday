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

export const Q2Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  disabled,
  hasAnswered,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="text-center py-2 space-y-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Which word describes this image?
        </span>
        <div className="max-w-xs mx-auto h-48 rounded-xl border border-border bg-sidebar overflow-hidden flex items-center justify-center p-2 shadow-sm">
          {question.prompt ? (
            <img
              src={question.prompt}
              alt={question.vocabItem.definition || "Vocabulary deck item illustration"}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No image available</span>
          )}
        </div>
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

export default Q2Renderer;
