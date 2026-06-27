import type { FC } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowCounterClockwise, ArrowRight } from "@phosphor-icons/react";
import { Card, Button } from "../../../components/ui";

interface SessionResultProps {
  totalUniqueCount: number;
  knownCount: number;
  stillLearningCount: number;
  accuracyPercent: number;
  score?: number;
  timeTakenSec?: number;
  onStudyAgain: () => void;
  onExit: () => void;
}

export const SessionResult: FC<SessionResultProps> = ({
  totalUniqueCount,
  knownCount,
  stillLearningCount,
  accuracyPercent,
  score,
  timeTakenSec,
  onStudyAgain,
  onExit,
}) => {
  const minutes = timeTakenSec ? Math.floor(timeTakenSec / 60) : 0;
  const seconds = timeTakenSec ? timeTakenSec % 60 : 0;

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
              Activity Completed!
            </h2>
            <p className="text-xs text-muted-foreground">
              Great effort study session finished. Here is your summary performance.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                Total
              </span>
              <span className="text-xl font-extrabold text-foreground mt-1.5 leading-none">
                {totalUniqueCount}
              </span>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600/70 leading-none">
                Known
              </span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1.5 leading-none">
                {knownCount}
              </span>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-amber-600/70 leading-none">
                Learning
              </span>
              <span className="text-xl font-extrabold text-amber-600 mt-1.5 leading-none">
                {stillLearningCount}
              </span>
            </div>
          </div>

          {/* Accuracy Score */}
          <div className="w-full bg-secondary/20 border border-border/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Score</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {score ?? accuracyPercent}
              </p>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Accuracy</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {accuracyPercent}%
              </p>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Time</span>
              <p className="text-base font-extrabold text-primary font-mono">
                {timeTakenSec === undefined ? "0s" : `${minutes}m ${seconds}s`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
            <Button
              variant="outline"
              className="w-full sm:flex-1 h-11"
              leftIcon={<ArrowCounterClockwise size={16} />}
              onClick={onStudyAgain}
            >
              Study Again
            </Button>

            <Button
              variant="primary"
              className="w-full sm:flex-1 h-11"
              leftIcon={<ArrowRight size={16} />}
              onClick={onExit}
            >
              Return Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
