import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "../api/assessment.api";
import type { SubmitAssignmentPayload } from "../api/assessment.api";

export function useSubmission(assignmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAssignmentPayload) => {
      if (!assignmentId) {
        return Promise.reject(new Error("Assignment ID is required"));
      }
      return submitAssignment(assignmentId, payload);
    },
    onSuccess: () => {
      // Invalidate related student dashboard/progress queries
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["mastery"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
