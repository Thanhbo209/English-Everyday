import type { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

export const CorrectAnimation: FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-2 text-emerald-500 py-4"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.4 }}
      >
        <CheckCircle size={64} weight="fill" />
      </motion.div>
      <span className="text-lg font-bold">Excellent! Correct Answer</span>
    </motion.div>
  );
};
