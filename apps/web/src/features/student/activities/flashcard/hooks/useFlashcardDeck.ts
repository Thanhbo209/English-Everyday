import { useMemo } from "react";
import { useVocabItems, useVocabSet } from "@/features/teacher/vocab-builder";
import { useAssignment } from "./useAssignment";

export function useFlashcardDeck(assignmentId?: string, vocabSetId?: string) {
  const assignmentQuery = useAssignment(assignmentId ?? "");
  const resolvedSetId = assignmentQuery.data?.vocabSetId ?? vocabSetId ?? "";
  const shouldUseVocabFallback = !assignmentId && !!resolvedSetId;
  const vocabSetQuery = useVocabSet(shouldUseVocabFallback ? resolvedSetId : "");
  const vocabItemsQuery = useVocabItems(shouldUseVocabFallback ? resolvedSetId : "");

  const items = useMemo(
    () => assignmentQuery.data?.vocabSet.vocabItems ?? vocabItemsQuery.data ?? [],
    [assignmentQuery.data?.vocabSet.vocabItems, vocabItemsQuery.data],
  );

  return {
    assignment: assignmentQuery.data,
    vocabSet: assignmentQuery.data?.vocabSet ?? vocabSetQuery.data,
    vocabItems: items,
    isLoading:
      assignmentQuery.isLoading || vocabSetQuery.isLoading || vocabItemsQuery.isLoading,
    isAssignmentSession: !!assignmentId,
  };
}
