import { z } from "zod";

export const CreateVocabItemSchema = z.object({
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  exampleSentence: z.string().optional(),
});

export const UpdateVocabItemSchema = z.object({
  term: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  exampleSentence: z.string().optional(),
});

export const VocabItemParamsSchema = z.object({
  id: z.string().uuid("Invalid vocab item ID"),
});

export const VocabSetItemParamsSchema = z.object({
  id: z.string().uuid("Invalid vocabulary set ID"),
});

// Phase 3 — reorder
export const ReorderItemsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1, "At least one item is required"),
});

export type CreateVocabItemInput = z.infer<typeof CreateVocabItemSchema>;
export type UpdateVocabItemInput = z.infer<typeof UpdateVocabItemSchema>;
export type VocabItemParams = z.infer<typeof VocabItemParamsSchema>;
export type VocabSetItemParams = z.infer<typeof VocabSetItemParamsSchema>;
export type ReorderItemsInput = z.infer<typeof ReorderItemsSchema>;
