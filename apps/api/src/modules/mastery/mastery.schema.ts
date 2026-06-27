import { z } from "zod";

export const MasteryParamsSchema = z.object({
  vocabSetId: z.string().uuid(),
});

export const ClassroomMasteryParamsSchema = z.object({
  id: z.string().uuid(),
});
