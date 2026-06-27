import { z } from "zod";

export const CreateVocabularySetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().min(1, "Language is required"),
  description: z.string().optional(),
  classroomId: z.string().uuid("Invalid classroom ID"),
});

export const UpdateVocabularySetSchema = z.object({
  title: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const VocabularySetParamsSchema = z.object({
  id: z.string().uuid("Invalid vocabulary set ID"),
});

export const VocabularySetQuerySchema = z.object({
  classroomId: z.string().uuid("Invalid classroom ID").optional(),
});

export type CreateVocabularySetInput = z.infer<
  typeof CreateVocabularySetSchema
>;
export type UpdateVocabularySetInput = z.infer<
  typeof UpdateVocabularySetSchema
>;
export type VocabularySetParams = z.infer<typeof VocabularySetParamsSchema>;
export type VocabularySetQuery = z.infer<typeof VocabularySetQuerySchema>;
