import type { FC } from "react";
import { motion } from "framer-motion";
import { XCircle } from "@phosphor-icons/react";

interface WrongAnimationProps {
  correctAnswerText?: string;
}

export const WrongAnimation: FC<WrongAnimationProps> = ({
  correctAnswerText,
}) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-2 text-destructive py-4 text-center"
    >
      <motion.div
        animate={{ x: [0, -10, 10, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <XCircle size={64} weight="fill" />
      </motion.div>
      <span className="text-lg font-bold">Incorrect Answer</span>
      {correctAnswerText && (
        <p className="text-sm text-muted-foreground mt-1">
          Correct Answer: <span className="font-bold text-foreground">{correctAnswerText}</span>
        </p>
      )}
    </motion.div>
  );
};
