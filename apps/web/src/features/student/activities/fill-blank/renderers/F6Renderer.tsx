import type { FC } from "react";
import { useEffect } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import type { AssessmentQuestion } from '../../types';
import { TextAnswerInput } from '../../components/TextAnswerInput';
import { ScrambledHint } from '../../components/ScrambledHint';
import { useAudioPlayer } from '@/features/student/activities/flashcard';

interface RendererProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasAnswered: boolean;
  isCorrect: boolean;
}

export const F6Renderer: FC<RendererProps> = ({
  question,
  value,
  onChange,
  onSubmit,
  disabled,
  hasAnswered,
  isCorrect,
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
          Listen and type the scrambled word you hear:
        </span>
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Play audio again"
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

export default F6Renderer;
