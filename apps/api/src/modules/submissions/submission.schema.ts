import { z } from "zod";

export const SubmitAssignmentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const SubmitAssignmentSchema = z.object({
  answers: z.any(),
  score: z.coerce.number().int().min(0),
  accuracy: z.coerce.number().min(0).max(100),
  timeTakenSec: z.coerce.number().int().min(0),
});

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;
