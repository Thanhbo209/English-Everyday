import type { FC } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowCounterClockwise, ArrowRight, Check, X } from "@phosphor-icons/react";
import { Card, Button } from "@/shared/components";

interface SessionSummaryProps {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  score: number;
  timeTakenSec: number;
  onRetry: () => void;
  onExit: () => void;
  isSubmitting?: boolean;
  answers?: Array<{
    term: string;
    isCorrect: boolean;
    userResponse: string;
  }>;
}

export const SessionSummary: FC<SessionSummaryProps> = ({
  total,
  correct,
  wrong,
  accuracy,
  score,
  timeTakenSec,
  onRetry,
  onExit,
  isSubmitting = false,
  answers = [],
}) => {
  const minutes = Math.floor(timeTakenSec / 60);
  const seconds = timeTakenSec % 60;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 space-y-6 flex flex-col items-center">
          {/* Trophy Header */}
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center shadow-sm">
            <Trophy size={36} weight="fill" className="animate-bounce" />
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Activity Completed!
            </h2>
            <p className="text-xs text-muted-foreground">
              Your results have been submitted and saved successfully.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Items
              </span>
              <span className="text-xl font-extrabold text-foreground mt-1.5 leading-none">
                {total}
              </span>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600/70 leading-none">
                Correct
              </span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1.5 leading-none">
                {correct}
              </span>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-red-600/70 leading-none">
                Wrong
              </span>
              <span className="text-xl font-extrabold text-red-500 mt-1.5 leading-none">
                {wrong}
              </span>
            </div>
          </div>

          {/* Accuracy Score */}
          <div className="w-full bg-secondary/25 border border-border/35 rounded-xl p-4 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Score</span>
              <p className="text-base font-extrabold text-primary font-mono mt-0.5">
                {score}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Accuracy</span>
              <p className="text-base font-extrabold text-primary font-mono mt-0.5">
                {accuracy}%
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Time</span>
              <p className="text-base font-extrabold text-primary font-mono mt-0.5">
                {minutes}:{seconds < 10 ? "0" : ""}${seconds}
              </p>
            </div>
          </div>

          {/* Answers Details List */}
          {answers.length > 0 && (
            <div className="w-full space-y-2 mt-4 text-left">
              <h3 className="text-sm font-bold text-foreground mb-3">Review Answers</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-border rounded-xl p-3 bg-secondary/10">
                {answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{ans.term}</p>
                      <p className="text-muted-foreground truncate">
                        Your answer: <span className={ans.isCorrect ? "text-emerald-500" : "text-destructive font-medium"}>{ans.userResponse || "(skipped)"}</span>
                      </p>
                    </div>
                    <div>
                      {ans.isCorrect ? (
                        <div className="bg-emerald-500/10 text-emerald-500 rounded-full p-1 border border-emerald-500/20">
                          <Check size={14} weight="bold" />
                        </div>
                      ) : (
                        <div className="bg-destructive/10 text-destructive rounded-full p-1 border border-destructive/20">
                          <X size={14} weight="bold" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isSubmitting}
              className="flex-1 gap-2 cursor-pointer"
            >
              <ArrowCounterClockwise size={16} />
              <span>Retry Activity</span>
            </Button>
            <Button
              onClick={onExit}
              disabled={isSubmitting}
              className="flex-1 gap-2 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
