import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "@/features/student/dashboard/api/learning.api";

export function useSubmission(assignmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      answers: any;
      score: number;
      accuracy: number;
      timeTakenSec: number;
    }) => {
      if (!assignmentId) {
        return Promise.reject(new Error("Assignment ID is required"));
      }
      return submitAssignment(assignmentId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["mastery"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
