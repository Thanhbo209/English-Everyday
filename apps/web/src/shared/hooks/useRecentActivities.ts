import { useQuery } from "@tanstack/react-query";
import { getAssignments } from "@/features/student/dashboard/api/learning.api";
import { getLiveSessions } from "@/features/student/dashboard/api/learning.api";
import { getVocabSets } from "@/features/teacher/vocab-builder/api/vocab.api";
import type { VocabSet } from "@/features/teacher/vocab-builder/api/vocab.api";

export interface RecentActivityItem {
  id: string;
  type: "SUBMISSION" | "ASSIGNMENT" | "LIVE_SESSION" | "VOCAB_SET";
  title: string;
  subtitle: string;
  timestamp: string;
  meta?: any;
}

export function useRecentActivities() {
  const assignmentsQuery = useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });

  const liveSessionsQuery = useQuery({
    queryKey: ["live-sessions"],
    queryFn: getLiveSessions,
  });

  const vocabSetsQuery = useQuery<VocabSet[]>({
    queryKey: ["vocab-sets"],
    queryFn: () => getVocabSets(),
  });

  const isLoading =
    assignmentsQuery.isLoading ||
    liveSessionsQuery.isLoading ||
    vocabSetsQuery.isLoading;

  const activities: RecentActivityItem[] = [];

  if (assignmentsQuery.data) {
    assignmentsQuery.data.forEach((assignment) => {
      // Add assignment creation activity
      activities.push({
        id: `assign-${assignment.id}`,
        type: "ASSIGNMENT",
        title: `New Assignment: ${assignment.title}`,
        subtitle: `Classroom: ${assignment.classroom?.name ?? "Classroom"} · Activity: ${assignment.activityType}`,
        timestamp: assignment.createdAt,
        meta: {
          activityType: assignment.activityType,
          dueAt: assignment.dueAt,
          submissionsCount: assignment._count?.submissions ?? 0,
        },
      });

      // Add submissions activity if existing
      if (assignment.submissions) {
        assignment.submissions.forEach((sub) => {
          activities.push({
            id: `sub-${sub.id}`,
            type: "SUBMISSION",
            title: `Student Submitted Assignment`,
            subtitle: `Score: ${sub.score} · Accuracy: ${sub.accuracy}% · Time: ${sub.timeTakenSec}s`,
            timestamp: sub.submittedAt,
            meta: {
              score: sub.score,
              accuracy: sub.accuracy,
            },
          });
        });
      }
    });
  }

  if (liveSessionsQuery.data) {
    liveSessionsQuery.data.forEach((session) => {
      if (session.startedAt) {
        activities.push({
          id: `live-${session.id}`,
          type: "LIVE_SESSION",
          title: `Live Session: ${session.vocabSet?.title ?? "Activity"}`,
          subtitle: `PIN: ${session.pin} · Status: ${session.status} · Players: ${session._count?.players ?? 0}`,
          timestamp: session.startedAt,
          meta: {
            pin: session.pin,
            status: session.status,
            players: session._count?.players ?? 0,
          },
        });
      }
    });
  }

  if (vocabSetsQuery.data) {
    vocabSetsQuery.data.forEach((vocab) => {
      activities.push({
        id: `vocab-${vocab.id}`,
        type: "VOCAB_SET",
        title: `New Vocabulary Set: ${vocab.title}`,
        subtitle: `Language: ${vocab.language} · Words: ${vocab._count?.vocabItems ?? 0}`,
        timestamp: vocab.createdAt,
      });
    });
  }

  // Sort activities by timestamp descending
  const sortedActivities = activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    isLoading,
    data: sortedActivities.slice(0, 10), // return top 10 recent
    refetch: () => {
      assignmentsQuery.refetch();
      liveSessionsQuery.refetch();
      vocabSetsQuery.refetch();
    },
  };
}
