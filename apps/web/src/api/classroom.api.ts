import { api } from "./axios";

export interface Classroom {
  id: string;
  name: string;
  description: string | null;
  teacherId: string;
  joinCode: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  teacher?: {
    name: string;
  };
  _count?: {
    classroomsMembers: number;
  };
}

export interface CreateClassroomPayload {
  name: string;
  description?: string;
}

export interface UpdateClassroomPayload {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface JoinClassroomPayload {
  joinCode: string;
}

export interface ClassroomMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: string;
  joinAt: string;
  user: ClassroomMemberUser;
}

export interface ClassroomWithMembers extends Classroom {
  classroomsMembers: ClassroomMember[];
}

export async function getClassrooms(): Promise<Classroom[]> {
  const response = await api.get<Classroom[]>("/classrooms");
  return response.data;
}

export async function getClassroomById(id: string): Promise<Classroom> {
  const response = await api.get<Classroom>(`/classrooms/${id}`);
  return response.data;
}

export async function createClassroom(payload: CreateClassroomPayload): Promise<Classroom> {
  const response = await api.post<Classroom>("/classrooms", payload);
  return response.data;
}

export async function updateClassroom(id: string, payload: UpdateClassroomPayload): Promise<Classroom> {
  const response = await api.patch<Classroom>(`/classrooms/${id}`, payload);
  return response.data;
}

export async function deleteClassroom(id: string): Promise<Classroom> {
  const response = await api.delete<Classroom>(`/classrooms/${id}`);
  return response.data;
}

export async function joinClassroom(payload: JoinClassroomPayload): Promise<any> {
  const response = await api.post<any>("/classrooms/join", payload);
  return response.data;
}

export async function getClassroomMembers(id: string): Promise<ClassroomMember[]> {
  const response = await api.get<ClassroomWithMembers[]>(`/classrooms/${id}/members`);
  // The API returns an array of classrooms, get members from the first matched one.
  return response.data[0]?.classroomsMembers ?? [];
}
