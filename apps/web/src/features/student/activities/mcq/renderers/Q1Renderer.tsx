import type { FC } from "react";
import type { AssessmentQuestion } from '../../types';
import { MCQOptions } from '../../components/MCQOptions';

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const Q1Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  disabled,
  hasAnswered,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="text-center py-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Select the correct image for:
        </span>
        <h3 className="text-3xl font-extrabold text-foreground mt-2">
          {question.prompt}
        </h3>
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

export default Q1Renderer;
