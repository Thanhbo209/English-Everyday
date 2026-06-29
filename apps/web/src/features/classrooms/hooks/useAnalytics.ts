import { useMemo } from "react";
import { useLeaderboard } from "@/shared/hooks/useLeaderboard";
import { useMasterySummary } from "@/shared/hooks/useMasterySummary";

export function useAnalytics(classroomId: string) {
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(classroomId);
  const { data: mastery, isLoading: loadingMastery } = useMasterySummary(undefined, classroomId);

  const analytics = useMemo(() => {
    // 1. Leaderboard & Student rankings
    const rankings = leaderboard || [];

    // 2. Weak Vocabulary items (sort by attempts desc, or status NEW/LEARNING first)
    const weakVocabulary = mastery?.items
      ? [...mastery.items]
          .filter((item) => item.status === "NEW" || item.status === "LEARNING")
          .sort((a, b) => b.attempts - a.attempts)
          .slice(0, 5)
      : [];

    // 3. Completion distribution (aggregated from leaderboard entries)
    const completionRanges = {
      above90: rankings.filter((s) => s.averageAccuracy >= 90).length,
      between70And90: rankings.filter((s) => s.averageAccuracy >= 70 && s.averageAccuracy < 90).length,
      below70: rankings.filter((s) => s.averageAccuracy < 70).length,
    };

    // 4. Accuracy distribution data points for charting
    const chartDataPoints = rankings.map((student) => ({
      name: student.name,
      value: student.averageAccuracy,
    }));

    return {
      rankings,
      weakVocabulary,
      completionRanges,
      chartDataPoints,
    };
  }, [leaderboard, mastery]);

  return {
    analytics,
    isLoading: loadingLeaderboard || loadingMastery,
  };
}
