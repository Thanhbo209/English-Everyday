import type { FC } from "react";
import { Microphone, Stop, Play, SpeakerHigh } from "@phosphor-icons/react";
import { Button } from "../../../components/ui";

interface SpeechRecorderProps {
  isRecording: boolean;
  seconds: number;
  audioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  targetAudioUrl?: string | null;
}

export const SpeechRecorder: FC<SpeechRecorderProps> = ({
  isRecording,
  seconds,
  audioUrl,
  onStart,
  onStop,
  targetAudioUrl,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  const playLocalRecording = () => {
    if (audioUrl) {
      new Audio(audioUrl).play().catch(() => {});
    }
  };

  const playTargetAudio = () => {
    if (targetAudioUrl) {
      new Audio(targetAudioUrl).play().catch(() => {});
    }
  };

  return (
    <div className="border border-border/80 bg-card rounded-2xl p-6 shadow-sm max-w-sm mx-auto select-none space-y-5">
      {/* Visual wave timer section */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-8 select-none">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-primary rounded-full animate-wave"
                style={{
                  height: `${h * 4}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-8 flex items-center justify-center text-xs text-muted-foreground font-semibold">
            Press Record to practice pronunciation
          </div>
        )}

        <div className="font-mono text-3xl font-extrabold text-foreground tracking-wider leading-none">
          {formatTime(seconds)}
        </div>
      </div>

      {/* Record button controls */}
      <div className="flex justify-center">
        {isRecording ? (
          <button
            onClick={onStop}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:scale-105 transition-all shadow-md cursor-pointer"
            title="Stop recording"
          >
            <Stop size={28} weight="fill" />
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-105 transition-all shadow-md cursor-pointer"
            title="Start recording"
          >
            <Microphone size={28} />
          </button>
        )}
      </div>

      {/* Playback comparators (only shown when recording exists) */}
      {audioUrl && !isRecording && (
        <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider select-none text-center">
            Pronunciation Playback
          </h4>

          <div className="flex items-center justify-between gap-3 bg-secondary/20 p-3 rounded-xl border border-border/40">
            {/* Local recording player */}
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">
                Your voice
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 py-0 px-3 flex items-center gap-1.5"
                leftIcon={<Play size={14} />}
                onClick={playLocalRecording}
              >
                Listen
              </Button>
            </div>

            {/* Target pronunciation player */}
            {targetAudioUrl && (
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">
                  Target key
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 py-0 px-3 flex items-center gap-1.5 hover:bg-primary/10 hover:text-primary"
                  leftIcon={<SpeakerHigh size={14} />}
                  onClick={playTargetAudio}
                >
                  Listen
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styled animation wave */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(2.2); }
        }
        .animate-wave {
          animation: wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
