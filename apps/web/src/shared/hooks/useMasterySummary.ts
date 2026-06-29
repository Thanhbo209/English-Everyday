import { useQuery } from "@tanstack/react-query";
import { getClassroomMastery, getMastery } from "@/features/student/dashboard/api/learning.api";

export function useMasterySummary(vocabSetId?: string, classroomId?: string) {
  return useQuery({
    queryKey: ["mastery", vocabSetId ?? "all", classroomId ?? "all"],
    queryFn: () => {
      if (classroomId) {
        return getClassroomMastery(classroomId);
      }
      return getMastery(vocabSetId);
    },
  });
}
