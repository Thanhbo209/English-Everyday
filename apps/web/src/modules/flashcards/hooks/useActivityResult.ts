import { useEffect, useRef, useState } from "react";
import type { Assignment } from "../../../api/learning.api";
import type { SessionItem } from "./useFlashcardSession";
import { useSubmission } from "./useSubmission";

export interface ActivityStats {
  total: number;
  known: number;
  stillLearning: number;
  accuracy: number;
}

export interface ActivityResultStats extends ActivityStats {
  score: number;
  timeTakenSec: number;
}

export function useActivityResult(
  assignment: Assignment | undefined,
  items: SessionItem[],
) {
  const startedAtRef = useRef(0);
  const [showResults, setShowResults] = useState(false);
  const [resultsStats, setResultsStats] = useState<ActivityResultStats | null>(null);
  const submission = useSubmission(assignment?.id);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [assignment?.id]);

  const finishSession = (stats: ActivityStats, answersMeta?: Record<string, unknown>) => {
    const startedAt = startedAtRef.current || Date.now();
    const timeTakenSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const result = {
      ...stats,
      score: stats.accuracy,
      timeTakenSec,
    };

    setResultsStats(result);
    setShowResults(true);

    if (assignment?.id) {
      submission.mutate({
        score: result.score,
        accuracy: result.accuracy,
        timeTakenSec,
        answers: {
          activityType: assignment.activityType,
          total: stats.total,
          ...answersMeta,
          mastery: items.map((item) => ({
            vocabItemId: item.id,
            status:
              stats.known > 0 && stats.stillLearning === 0
                ? "KNOWN"
                : "LEARNING",
          })),
        },
      });
    }
  };

  const finishSelfRatedSession = (
    stats: ActivityStats,
    knownIds: Set<string>,
    stillLearningIds: Set<string>,
  ) => {
    const startedAt = startedAtRef.current || Date.now();
    const timeTakenSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const result = {
      ...stats,
      score: stats.accuracy,
      timeTakenSec,
    };

    setResultsStats(result);
    setShowResults(true);

    if (assignment?.id) {
      submission.mutate({
        score: result.score,
        accuracy: result.accuracy,
        timeTakenSec,
        answers: {
          activityType: assignment.activityType,
          total: stats.total,
          mastery: items.map((item) => ({
            vocabItemId: item.id,
            status: knownIds.has(item.id)
              ? "KNOWN"
              : stillLearningIds.has(item.id)
                ? "LEARNING"
                : "NEW",
          })),
        },
      });
    }
  };

  const resetResults = () => {
    startedAtRef.current = Date.now();
    setShowResults(false);
    setResultsStats(null);
  };

  return {
    showResults,
    resultsStats,
    finishSession,
    finishSelfRatedSession,
    resetResults,
    submission,
  };
}
