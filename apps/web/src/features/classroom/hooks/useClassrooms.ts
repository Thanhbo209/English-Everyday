import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  joinClassroom,
  getClassroomMembers,
} from "../../../api/classroom.api";
import type {
  CreateClassroomPayload,
  UpdateClassroomPayload,
  JoinClassroomPayload,
} from "../../../api/classroom.api";

export function useClassrooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: getClassrooms,
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: ["classroom", id],
    queryFn: () => getClassroomById(id),
    enabled: !!id,
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassroomPayload) => createClassroom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassroomPayload }) =>
      updateClassroom(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["classroom", variables.id] });
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClassroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

export function useJoinClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinClassroomPayload) => joinClassroom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

export function useClassroomMembers(id: string) {
  return useQuery({
    queryKey: ["classroom-members", id],
    queryFn: () => getClassroomMembers(id),
    enabled: !!id,
  });
}
