import { api } from "../../../../shared/api/axios";
import type { ActivityType } from "@/features/student/dashboard/api/learning.api";
export type { ActivityType };

export interface Assignment {
  id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  activityType: ActivityType;
  vocabSetId: string;
  config: Record<string, unknown>;
  dueAt: string | null;
  createdAt: string;
  classroom?: {
    id: string;
    name: string;
  };
  vocabSet?: {
    id: string;
    title: string;
    language: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface CreateAssignmentPayload {
  classroomId: string;
  title: string;
  activityType: ActivityType;
  vocabSetId: string;
  config?: Record<string, unknown>;
  dueAt?: string;
}

export interface UpdateAssignmentPayload {
  title?: string;
  activityType?: ActivityType;
  vocabSetId?: string;
  config?: Record<string, unknown>;
  dueAt?: string | null;
}

export async function getAssignments(): Promise<Assignment[]> {
  const response = await api.get<Assignment[]>("/assignments");
  return response.data;
}

export async function createAssignment(
  payload: CreateAssignmentPayload,
): Promise<Assignment> {
  const response = await api.post<Assignment>("/assignments", payload);
  return response.data;
}

export async function updateAssignment(
  id: string,
  payload: UpdateAssignmentPayload,
): Promise<Assignment> {
  const response = await api.patch<Assignment>(`/assignments/${id}`, payload);
  return response.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}
