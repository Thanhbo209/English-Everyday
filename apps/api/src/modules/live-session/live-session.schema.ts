import { z } from "zod";
import { ActivityTypeSchema } from "../learning/learning.schema";

export const LiveSessionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CreateLiveSessionSchema = z.object({
  classroomId: z.string().uuid(),
  activityType: ActivityTypeSchema,
  vocabSetId: z.string().uuid(),
  config: z.record(z.string(), z.any()).default({}),
});

export const UpdateLiveSessionSchema = z.object({
  config: z.record(z.string(), z.any()).optional(),
  status: z.enum(["WAITING", "ACTIVE", "ENDED"]).optional(),
});

export const JoinLiveSessionSchema = z.object({
  pin: z.string().trim().min(4).max(8),
});

export const SubmitLiveSessionSchema = z.object({
  score: z.coerce.number().int().min(0),
  answers: z.any(),
});

export type CreateLiveSessionInput = z.infer<typeof CreateLiveSessionSchema>;
export type UpdateLiveSessionInput = z.infer<typeof UpdateLiveSessionSchema>;
export type JoinLiveSessionInput = z.infer<typeof JoinLiveSessionSchema>;
export type SubmitLiveSessionInput = z.infer<typeof SubmitLiveSessionSchema>;
