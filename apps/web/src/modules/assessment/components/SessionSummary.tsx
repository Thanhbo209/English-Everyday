import type { FC } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowCounterClockwise, ArrowRight } from "@phosphor-icons/react";
import { Card, Button } from "../../../components/ui";

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
}) => {
  const minutes = Math.floor(timeTakenSec / 60);
  const seconds = timeTakenSec % 60;

  return (
    <div className="max-w-md mx-auto py-10 px-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 space-y-6 flex flex-col items-center text-center">
          {/* Trophy Header */}
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center shadow-sm">
            <Trophy size={36} weight="fill" className="animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Assessment Completed!
            </h2>
            <p className="text-xs text-muted-foreground">
              Your results have been submitted and saved successfully.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Questions
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
          <div className="w-full bg-secondary/20 border border-border/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Score</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {score}
              </p>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Accuracy</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {accuracy}%
              </p>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Time</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {minutes}m {seconds}s
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full pt-4">
            <Button
              onClick={onExit}
              variant="primary"
              loading={isSubmitting}
              className="w-full justify-center font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                Return to Dashboard
                <ArrowRight size={18} />
              </span>
            </Button>

            <Button
              onClick={onRetry}
              disabled={isSubmitting}
              variant="ghost"
              className="w-full justify-center font-semibold cursor-pointer"
              leftIcon={<ArrowCounterClockwise size={18} />}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
