import { api } from "@/shared/api/axios";
import type { VocabItem, VocabSet } from "@/features/teacher/vocab-builder/api/vocab.api";

export type ActivityType =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10"
  | "G11"
  | "S1"
  | "S2"
  | "L1"
  | "L2"
  | "L3"
  | "L4"
  | "L5"
  | "L6"
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "Q5"
  | "Q6"
  | "Q7"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6";

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
  vocabSet: VocabSet & {
    vocabItems?: VocabItem[];
    _count?: {
      vocabItems: number;
    };
  };
  submissions?: Submission[];
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

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: unknown;
  score: number;
  accuracy: number;
  timeTakenSec: number;
  status: "SUBMITTED" | "GRADED";
  submittedAt: string;
}

export interface SubmitAssignmentPayload {
  answers: unknown;
  score: number;
  accuracy: number;
  timeTakenSec: number;
}

export interface SubmitAssignmentResult {
  submission: Submission;
  progressRecord: unknown;
  masteryUpdated: number;
}

export interface ProgressSummary {
  history: Array<{
    id: string;
    vocabSetId: string;
    activityType: ActivityType;
    score: number;
    accuracy: number;
    recordedAt: string;
    vocabSet?: {
      id: string;
      title: string;
      language: string;
    };
  }>;
  accuracy: number;
  bestScore: number;
  activitiesCompleted: number;
}

export interface MasterySummary {
  known: number;
  learning: number;
  new: number;
  total: number;
  percentages: {
    known: number;
    learning: number;
    new: number;
  };
  items: Array<{
    vocabItemId: string;
    term: string;
    status: "NEW" | "LEARNING" | "KNOWN";
    attempts: number;
    lastSeenAt: string | null;
  }>;
}

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatarUrl: string;
  score: number;
  attempts: number;
  averageAccuracy: number;
  rank: number;
}

export interface LiveSession {
  id: string;
  classroomId: string;
  teacherId: string;
  activityType: ActivityType;
  vocabSetId: string;
  config: Record<string, unknown>;
  status: "WAITING" | "ACTIVE" | "ENDED";
  pin: string;
  scores: unknown;
  startedAt: string | null;
  endedAt: string | null;
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
    players: number;
  };
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

export async function getStudentAssignments(): Promise<Assignment[]> {
  const response = await api.get<Assignment[]>("/students/assignments");
  return response.data;
}

export async function getStudentAssignment(id: string): Promise<Assignment> {
  const response = await api.get<Assignment>(`/students/assignments/${id}`);
  return response.data;
}

export async function submitAssignment(
  assignmentId: string,
  payload: SubmitAssignmentPayload,
): Promise<SubmitAssignmentResult> {
  const response = await api.post<SubmitAssignmentResult>(
    `/assignments/${assignmentId}/submit`,
    payload,
  );
  return response.data;
}

export async function getProgress(vocabSetId?: string): Promise<ProgressSummary> {
  const response = await api.get<ProgressSummary>(
    vocabSetId ? `/progress/me/${vocabSetId}` : "/progress/me",
  );
  return response.data;
}

export async function getMastery(vocabSetId?: string): Promise<MasterySummary> {
  const response = await api.get<MasterySummary>(
    vocabSetId ? `/mastery/me/${vocabSetId}` : "/mastery/me",
  );
  return response.data;
}

export async function getClassroomMastery(
  classroomId: string,
): Promise<MasterySummary> {
  const response = await api.get<MasterySummary>(
    `/mastery/classroom/${classroomId}`,
  );
  return response.data;
}

export async function getClassroomLeaderboard(
  classroomId: string,
  period: "WEEK" | "MONTH" | "ALL" = "ALL",
): Promise<LeaderboardEntry[]> {
  const response = await api.get<LeaderboardEntry[]>(
    `/leaderboard/classroom/${classroomId}`,
    { params: { period } },
  );
  return response.data;
}

export async function getGlobalLeaderboard(
  period: "WEEK" | "MONTH" | "ALL" = "ALL",
): Promise<LeaderboardEntry[]> {
  const response = await api.get<LeaderboardEntry[]>("/leaderboard/global", {
    params: { period },
  });
  return response.data;
}

export async function getLiveSessions(): Promise<LiveSession[]> {
  const response = await api.get<LiveSession[]>("/live-sessions");
  return response.data;
}
