import type { FC } from "react";
import { motion } from "framer-motion";

interface QuestionProgressProps {
  currentIndex: number;
  totalCards: number;
}

export const QuestionProgress: FC<QuestionProgressProps> = ({
  currentIndex,
  totalCards,
}) => {
  const percentage = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
        <span>
          Question <strong className="text-foreground">{currentIndex + 1}</strong> of{" "}
          <strong className="text-foreground">{totalCards}</strong>
        </span>
        <span>{Math.round((currentIndex / totalCards) * 100)}% complete</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
