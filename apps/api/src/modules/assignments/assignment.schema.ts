import { z } from "zod";
import { ActivityTypeSchema } from "../learning/learning.schema";

export const AssignmentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const AssignmentQuerySchema = z.object({
  classroomId: z.string().uuid().optional(),
  vocabSetId: z.string().uuid().optional(),
});

export const CreateAssignmentSchema = z.object({
  classroomId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  activityType: ActivityTypeSchema,
  vocabSetId: z.string().uuid(),
  config: z.record(z.string(), z.any()).default({}),
  dueAt: z.coerce.date().optional(),
});

export const UpdateAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  activityType: ActivityTypeSchema.optional(),
  vocabSetId: z.string().uuid().optional(),
  config: z.record(z.string(), z.any()).optional(),
  dueAt: z.coerce.date().nullable().optional(),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;
export type AssignmentQueryInput = z.infer<typeof AssignmentQuerySchema>;
