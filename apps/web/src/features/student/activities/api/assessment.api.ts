export {
  getStudentAssignment,
  submitAssignment,
  getProgress,
  getMastery,
} from "@/features/student/dashboard/api/learning.api";

export type {
  Assignment,
  Submission,
  SubmitAssignmentPayload,
  SubmitAssignmentResult,
  ProgressSummary,
  MasterySummary,
} from "@/features/student/dashboard/api/learning.api";
