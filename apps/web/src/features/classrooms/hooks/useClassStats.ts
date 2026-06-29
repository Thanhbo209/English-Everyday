import { useMemo } from "react";

import { useAssignments } from "@/features/teacher/assignments";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import { useLeaderboard } from "@/shared/hooks/useLeaderboard";

export function useClassStats(classroomId: string) {
  const { data: assignments, isLoading: loadingAssignments } = useAssignments();
  const { data: vocabSets, isLoading: loadingVocabSets } = useVocabSets(classroomId);
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(classroomId);

  const stats = useMemo(() => {
    const classAssignments = assignments?.filter((a) => a.classroomId === classroomId) || [];
    const classVocabSets = vocabSets || [];
    const studentCount = leaderboard?.length ?? 0;

    const totalSubmissions = classAssignments.reduce((acc, a) => acc + (a._count?.submissions ?? 0), 0);
    const maxPossibleSubmissions = classAssignments.length * studentCount;
    const completionRate = maxPossibleSubmissions > 0
      ? Math.round((totalSubmissions / maxPossibleSubmissions) * 100)
      : 0;

    const avgAccuracy = leaderboard && leaderboard.length > 0
      ? Math.round(leaderboard.reduce((acc, student) => acc + student.averageAccuracy, 0) / leaderboard.length)
      : 0;

    const totalXP = leaderboard?.reduce((acc, s) => acc + s.score, 0) ?? 0;

    return {
      studentCount,
      assignmentCount: classAssignments.length,
      vocabCount: classVocabSets.length,
      completionRate,
      averageAccuracy: avgAccuracy,
      totalXP,
    };
  }, [assignments, vocabSets, leaderboard, classroomId]);

  return {
    stats,
    isLoading: loadingAssignments || loadingVocabSets || loadingLeaderboard,
  };
}
