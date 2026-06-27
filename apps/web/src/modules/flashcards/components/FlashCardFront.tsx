import type { FC } from "react";
import { ImageSquare, SpeakerHigh } from "@phosphor-icons/react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

interface FlashCardFrontProps {
  term: string;
  imageUrl?: string | null;
  hideTerm?: boolean;
  isListeningMode?: boolean;
  audioUrl?: string | null;
}

export const FlashCardFront: FC<FlashCardFrontProps> = ({
  term,
  imageUrl,
  hideTerm = false,
  isListeningMode = false,
  audioUrl,
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
      {/* Front Label indicator */}
      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary/35 py-1 px-3.5 rounded-full select-none">
        {isListeningMode ? "Listen" : "Word"}
      </span>

      {/* Centered Term and Image */}
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-5">
        {isListeningMode ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleAudioPlay}
              className={`w-24 h-24 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary/20 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer ${
                isPlaying ? "animate-pulse border-primary animate-pulse-slow" : ""
              }`}
              title="Play Pronunciation"
            >
              <SpeakerHigh size={40} weight="fill" />
            </button>
            <h3 className="text-3xl font-extrabold text-muted-foreground/60 select-none">
              ?
            </h3>
          </div>
        ) : (
          <>
            {imageUrl ? (
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-border bg-muted shadow-sm select-none">
                <img src={imageUrl} alt={term} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex w-36 h-36 md:w-44 md:h-44 rounded-2xl items-center justify-center border border-dashed border-border text-muted-foreground/45 bg-muted/10">
                <ImageSquare size={36} />
              </div>
            )}

            {!hideTerm ? (
              <h3 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight text-center leading-normal max-w-md break-words">
                {term}
              </h3>
            ) : (
              <div className="h-10 w-44 rounded bg-secondary animate-pulse" />
            )}
          </>
        )}
      </div>

      {/* Tip helper */}
      <div className="text-[10px] text-muted-foreground/60 leading-none">
        {isListeningMode ? "Listen first, then flip to reveal card" : "Click or tap to flip card"}
      </div>
    </div>
  );
};
