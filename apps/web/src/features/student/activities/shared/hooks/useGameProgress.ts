import { useMemo } from "react";

export function useGameProgress(currentIndex: number, totalCards: number) {
  return useMemo(() => {
    const percentage = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;
    return {
      percentage: Math.round(percentage),
      progressString: `${currentIndex + 1} of ${totalCards}`,
    };
  }, [currentIndex, totalCards]);
}
