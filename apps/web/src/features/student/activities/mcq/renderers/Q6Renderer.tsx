import type { FC } from "react";
import { useEffect } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import type { AssessmentQuestion } from '../../types';
import { MCQOptions } from '../../components/MCQOptions';
import { useAudioPlayer } from '@/features/student/activities/flashcard';

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const Q6Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  disabled,
  hasAnswered,
}) => {
  const { play, isPlaying } = useAudioPlayer();

  // Auto-play audio on question load
  useEffect(() => {
    if (question.prompt) {
      play(question.prompt);
    }
  }, [question.prompt]);

  return (
    <div className="w-full space-y-6">
      <div className="text-center py-4 space-y-4">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          Listen and select the matching image:
        </span>
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Play audio prompt"
            onClick={() => question.prompt && play(question.prompt)}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/95 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <SpeakerHigh
              size={32}
              weight="fill"
              className={isPlaying ? "animate-pulse" : ""}
            />
          </button>
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

export default Q6Renderer;
