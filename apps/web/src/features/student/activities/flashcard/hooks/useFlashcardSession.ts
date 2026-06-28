import { useState, useEffect, useRef } from "react";

export interface SessionItem {
  id: string;
  term: string;
  definition: string;
  phonetic?: string | null;
  exampleSentence?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

export interface FlashcardSessionOptions {
  autoPlayInterval?: number; // ms, default 3000
  isAutoPlayMode?: boolean; // A1 mode
  onSessionFinish?: (
    stats: {
      total: number;
      known: number;
      stillLearning: number;
      accuracy: number;
    },
    knownIds: Set<string>,
    stillLearningIds: Set<string>,
  ) => void;
}

export function useFlashcardSession(
  initialItems: SessionItem[],
  options: FlashcardSessionOptions = {},
) {
  const { autoPlayInterval = 3000, isAutoPlayMode = false, onSessionFinish } = options;

  // Working queue of items (for A3, items can be re-added)
  const [queue, setQueue] = useState<SessionItem[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tracks unique cards' rating
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [stillLearningIds, setStillLearningIds] = useState<Set<string>>(new Set());

  // Auto-play state (for A1)
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayStep, setAutoPlayStep] = useState<"term" | "definition">("term");
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalUniqueCount = initialItems.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue(initialItems);
    setCurrentIndex(0);
    setKnownIds(new Set());
    setStillLearningIds(new Set());
    setIsPlaying(false);
  }, [initialItems]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const triggerSessionFinish = (
    knownOverride = knownIds,
    stillLearningOverride = stillLearningIds,
  ) => {
    if (onSessionFinish) {
      const knownCount = knownOverride.size;
      const stillLearningCount = stillLearningOverride.size;
      const accuracy = totalUniqueCount > 0 ? Math.round((knownCount / totalUniqueCount) * 100) : 0;
      onSessionFinish(
        {
          total: totalUniqueCount,
          known: knownCount,
          stillLearning: stillLearningCount,
          accuracy,
        },
        knownOverride,
        stillLearningOverride,
      );
    }
  };

  // A1 Learn mode logic: automatic progression
  useEffect(() => {
    if (!isAutoPlayMode || !isPlaying || queue.length === 0) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (autoPlayStep === "term") {
        setAutoPlayStep("definition");
      } else {
        setAutoPlayStep("term");
        if (currentIndex < queue.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          triggerSessionFinish();
        }
      }
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, autoPlayStep, currentIndex, queue, isAutoPlayMode, autoPlayInterval]);

  const nextCard = (
    knownOverride = knownIds,
    stillLearningOverride = stillLearningIds,
  ) => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAutoPlayStep("term");
      return true;
    } else {
      triggerSessionFinish(knownOverride, stillLearningOverride);
      return false;
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setAutoPlayStep("term");
      return true;
    }
    return false;
  };

  const markKnown = (itemId: string) => {
    const nextKnown = new Set(knownIds);
    nextKnown.add(itemId);
    const nextStillLearning = new Set(stillLearningIds);
    nextStillLearning.delete(itemId);

    setKnownIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
    setStillLearningIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });

    // Advance
    nextCard(nextKnown, nextStillLearning);
  };

  const markStillLearning = (itemId: string, reQueue = false) => {
    const nextStillLearning = new Set(stillLearningIds);
    nextStillLearning.add(itemId);
    const nextKnown = new Set(knownIds);
    nextKnown.delete(itemId);

    setStillLearningIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
    setKnownIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });

    if (reQueue) {
      // Add current card to the back of the queue
      const currentItem = queue[currentIndex];
      setQueue((prev) => [...prev, currentItem]);
    }

    // Advance
    nextCard(nextKnown, nextStillLearning);
  };

  const resetSession = () => {
    setQueue(initialItems);
    setCurrentIndex(0);
    setKnownIds(new Set());
    setStillLearningIds(new Set());
    setIsPlaying(false);
    setAutoPlayStep("term");
  };

  return {
    currentItem: queue[currentIndex] || null,
    currentIndex,
    totalCards: queue.length,
    totalUniqueCount,
    knownIds,
    stillLearningIds,
    isPlaying,
    autoPlayStep,
    setIsPlaying,
    nextCard,
    prevCard,
    markKnown,
    markStillLearning,
    resetSession,
  };
}
