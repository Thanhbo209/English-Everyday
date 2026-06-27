// classroom.schema.ts

import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z.string().trim().min(3).max(100),

  description: z.string().trim().max(500).optional(),
});

export const joinClassroomSchema = z.object({
  joinCode: z.string().trim().length(6),
});

export type CreateClassroomPayload = z.infer<typeof createClassroomSchema>;

export type JoinClassroomPayload = z.infer<typeof joinClassroomSchema>;
