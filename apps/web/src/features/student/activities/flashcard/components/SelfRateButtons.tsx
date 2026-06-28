import type { FC } from "react";
import { Check, X } from "@phosphor-icons/react";

interface SelfRateButtonsProps {
  onKnown: () => void;
  onStillLearning: () => void;
}

export const SelfRateButtons: FC<SelfRateButtonsProps> = ({ onKnown, onStillLearning }) => {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto select-none pt-4">
      {/* Still Learning button (orange) */}
      <button
        onClick={onStillLearning}
        className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold tracking-wide border border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-sm"
      >
        <X size={15} weight="bold" />
        Still Learning
      </button>

      {/* Known button (green) */}
      <button
        onClick={onKnown}
        className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold tracking-wide border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-sm"
      >
        <Check size={15} weight="bold" />
        Know It
      </button>
    </div>
  );
};
