import { useQuery } from "@tanstack/react-query";
import { getProgress } from "../../../api/learning.api";

export function useProgress(vocabSetId?: string) {
  return useQuery({
    queryKey: ["progress", vocabSetId],
    queryFn: () => getProgress(vocabSetId),
  });
}
