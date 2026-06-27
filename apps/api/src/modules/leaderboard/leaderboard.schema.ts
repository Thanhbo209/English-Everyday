import { z } from "zod";

export const LeaderboardClassroomParamsSchema = z.object({
  id: z.string().uuid(),
});

export const LeaderboardQuerySchema = z.object({
  period: z.enum(["WEEK", "MONTH", "ALL"]).default("ALL"),
});

export type LeaderboardPeriodInput = z.infer<typeof LeaderboardQuerySchema>["period"];
