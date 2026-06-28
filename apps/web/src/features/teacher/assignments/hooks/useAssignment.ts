import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  updateAssignment,
} from "../api/assignment.api";
import type {
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "../api/assignment.api";

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssignmentPayload }) =>
      updateAssignment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student-assignment", variables.id] });
    },
  });
}
