import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssignment } from "../../../api/learning.api";
import type { SubmitAssignmentPayload } from "../../../api/learning.api";

export function useSubmission(assignmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAssignmentPayload) => {
      if (!assignmentId) {
        return Promise.reject(new Error("Assignment id is required"));
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
