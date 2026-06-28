import { useQuery } from "@tanstack/react-query";
import { getClassroomMastery, getMastery } from "@/features/student/dashboard/api/learning.api";

export function useMastery(vocabSetId?: string) {
  return useQuery({
    queryKey: ["mastery", vocabSetId],
    queryFn: () => getMastery(vocabSetId),
  });
}

export function useClassroomMastery(classroomId?: string) {
  return useQuery({
    queryKey: ["mastery", "classroom", classroomId],
    queryFn: () => getClassroomMastery(classroomId ?? ""),
    enabled: !!classroomId,
  });
}
