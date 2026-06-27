import { z } from "zod";

export const ProgressParamsSchema = z.object({
  vocabSetId: z.string().uuid(),
});
