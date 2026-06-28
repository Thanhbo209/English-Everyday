import type { FC } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

interface FlashCardBackProps {
  definition: string;
  phonetic?: string | null;
  partOfSpeech?: string;
  exampleSentence?: string | null;
  audioUrl?: string | null;
  blurDefinition?: boolean;
}

export const FlashCardBack: FC<FlashCardBackProps> = ({
  definition,
  phonetic,
  partOfSpeech = "NOUN",
  exampleSentence,
  audioUrl,
  blurDefinition = false,
}) => {
  const { play, isPlaying } = useAudioPlayer();

  function handleAudioPlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (audioUrl) {
      play(audioUrl);
    }
  }

  return (
    <div className="flex flex-col justify-between items-center h-full w-full p-8 select-none">
      {/* Header tags */}
      <div className="flex justify-between items-center w-full">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary/35 py-1 px-3.5 rounded-full select-none">
          Meaning
        </span>

        <div className="flex items-center gap-2">
          {partOfSpeech && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary/20 text-primary py-0.5 px-2.5 rounded-md border border-primary/25">
              {partOfSpeech}
            </span>
          )}

          {audioUrl && (
            <button
              onClick={handleAudioPlay}
              className={`p-1.5 rounded-lg border border-border/80 bg-card hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
                isPlaying ? "text-primary animate-pulse" : ""
              }`}
              title="Pronunciation pronunciation"
            >
              <SpeakerHigh size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Centered meaning definition & examples */}
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 max-w-sm">
        <div className="space-y-2 text-center w-full">
          <p
            className={`text-lg md:text-xl font-bold text-foreground leading-normal transition-all duration-300 ${
              blurDefinition ? "blur-md select-none opacity-40" : ""
            }`}
          >
            {definition}
          </p>

          {phonetic && (
            <p className="text-xs font-mono text-muted-foreground bg-secondary/30 px-3 py-1 rounded-md w-fit mx-auto">
              /{phonetic}/
            </p>
          )}
        </div>

        {exampleSentence && !blurDefinition && (
          <p className="text-xs md:text-sm text-muted-foreground italic font-serif leading-relaxed text-center border-t border-border/40 pt-3.5 w-full">
            "{exampleSentence}"
          </p>
        )}
      </div>

      {/* Tip helper */}
      <div className="text-[10px] text-muted-foreground/60 leading-none">
        Click or tap to flip card
      </div>
    </div>
  );
};
