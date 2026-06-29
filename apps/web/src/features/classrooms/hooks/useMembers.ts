import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useToast } from "@/shared/components";
import { getClassroomMembers } from "../api/classroom.api";

export function useMembers(classroomId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "joinDate">("name");

  const query = useQuery({
    queryKey: ["classroom-members", classroomId],
    queryFn: () => getClassroomMembers(classroomId),
    enabled: !!classroomId,
  });

  const sortedAndFilteredMembers = useMemo(() => {
    if (!query.data) return [];
    let items = [...query.data];

    if (searchTerm) {
      items = items.filter((member) =>
        member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    items.sort((a, b) => {
      if (sortBy === "name") {
        return a.user.name.localeCompare(b.user.name);
      } else {
        return new Date(b.joinAt).getTime() - new Date(a.joinAt).getTime();
      }
    });

    return items;
  }, [query.data, searchTerm, sortBy]);

  // Simulate remove student (since no backend route exists yet)
  const removeMutation = useMutation({
    mutationFn: async (studentId: string) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return studentId;
    },
    onSuccess: (studentId) => {
      toast.success("Student membership removed (Simulated UI action)");
      // Update local React Query cache optimistically
      queryClient.setQueryData(
        ["classroom-members", classroomId],
        (old: any) => old?.filter((m: any) => m.studentId !== studentId) || []
      );
    },
  });

  return {
    members: sortedAndFilteredMembers,
    rawMembers: query.data || [],
    isLoading: query.isLoading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    removeStudent: (studentId: string) => removeMutation.mutate(studentId),
    isRemoving: removeMutation.isPending,
  };
}
