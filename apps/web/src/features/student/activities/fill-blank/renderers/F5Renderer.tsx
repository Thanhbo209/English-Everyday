import type { FC } from "react";
import type { AssessmentQuestion } from '../../types';
import { TextAnswerInput } from '../../components/TextAnswerInput';
import { ScrambledHint } from '../../components/ScrambledHint';

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const F5Renderer: FC<RendererProps> = ({
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
          Type the scrambled word matching this definition:
        </span>
        <blockquote className="text-lg font-semibold text-foreground italic border-l-4 border-primary/20 pl-4 py-1 text-left bg-secondary/10 rounded-r-lg">
          "{question.prompt}"
        </blockquote>
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

export default F5Renderer;
