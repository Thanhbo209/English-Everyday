import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/components";
import { updateClassroom, deleteClassroom } from "../api/classroom.api";

export function useQuickActions(classroomId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; description?: string; status?: "ACTIVE" | "INACTIVE" }) =>
      updateClassroom(classroomId, payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status
          ? `Classroom status updated to ${variables.status.toLowerCase()}`
          : "Classroom updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClassroom(classroomId),
    onSuccess: () => {
      toast.success("Classroom deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });

  const toggleStatus = (currentStatus: "ACTIVE" | "INACTIVE") => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateMutation.mutate({ status: newStatus });
  };

  return {
    toggleStatus,
    updateClassroom: (payload: { name: string; description?: string }) => updateMutation.mutate(payload),
    deleteClassroom: () => deleteMutation.mutate(),
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
