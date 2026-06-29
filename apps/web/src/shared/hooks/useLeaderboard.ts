import { useQuery } from "@tanstack/react-query";
import {
  getClassroomLeaderboard,
  getGlobalLeaderboard,
} from "@/features/student/dashboard/api/learning.api";

export function useLeaderboard(
  classroomId?: string,
  period: "WEEK" | "MONTH" | "ALL" = "ALL"
) {
  return useQuery({
    queryKey: ["leaderboard", classroomId ?? "global", period],
    queryFn: () =>
      classroomId
        ? getClassroomLeaderboard(classroomId, period)
        : getGlobalLeaderboard(period),
  });
}
