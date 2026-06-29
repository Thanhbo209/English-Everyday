import { useQuery } from "@tanstack/react-query";
import { getProgress } from "@/features/student/dashboard/api/learning.api";

export function useProgressSummary(vocabSetId?: string) {
  return useQuery({
    queryKey: ["progress", vocabSetId],
    queryFn: () => getProgress(vocabSetId),
  });
}
