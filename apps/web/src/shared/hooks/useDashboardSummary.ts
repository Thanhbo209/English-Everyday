import { useQuery } from "@tanstack/react-query";
import { getClassrooms } from "@/features/classrooms";
import type { Classroom } from "@/features/classrooms";
import { getAssignments } from "@/features/student/dashboard/api/learning.api";
import { getClassroomLeaderboard } from "@/features/student/dashboard/api/learning.api";
import { getLiveSessions } from "@/features/student/dashboard/api/learning.api";

export function useDashboardSummary(classroomId?: string) {
  const classroomsQuery = useQuery<Classroom[]>({
    queryKey: ["classrooms"],
    queryFn: getClassrooms,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", classroomId ?? "global", "ALL"],
    queryFn: () => classroomId ? getClassroomLeaderboard(classroomId, "ALL") : Promise.resolve([]),
    enabled: !!classroomId,
  });

  const liveSessionsQuery = useQuery({
    queryKey: ["live-sessions"],
    queryFn: getLiveSessions,
  });

  const isLoading =
    classroomsQuery.isLoading ||
    assignmentsQuery.isLoading ||
    leaderboardQuery.isLoading ||
    liveSessionsQuery.isLoading;

  const classrooms = classroomsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const leaderboard = leaderboardQuery.data ?? [];
  const liveSessions = liveSessionsQuery.data ?? [];

  const totalClassrooms = classrooms.length;
  const totalStudents = classrooms.reduce(
    (acc, classroom) => acc + (classroom._count?.classroomsMembers ?? 0),
    0
  );
  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce(
    (acc, assignment) => acc + (assignment._count?.submissions ?? 0),
    0
  );
  const activeAssignments = assignments.filter((a) => {
    if (!a.dueAt) return true;
    return new Date(a.dueAt) > new Date();
  }).length;

  const completionRate =
    totalAssignments > 0 && totalStudents > 0
      ? Math.round((totalSubmissions / (totalAssignments * totalStudents)) * 100)
      : 0;

  const averageAccuracy =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce((sum, entry) => sum + entry.averageAccuracy, 0) /
            leaderboard.length
        )
      : 0;

  const averageScore =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce((sum, entry) => sum + entry.score, 0) /
            leaderboard.length
        )
      : 0;

  return {
    isLoading,
    data: {
      totalClassrooms,
      totalStudents,
      totalAssignments,
      activeAssignments,
      completionRate,
      averageAccuracy,
      averageScore,
      activeLiveSessionsCount: liveSessions.filter((s) => s.status !== "ENDED").length,
    },
    refetch: () => {
      classroomsQuery.refetch();
      assignmentsQuery.refetch();
      leaderboardQuery.refetch();
      liveSessionsQuery.refetch();
    },
  };
}
