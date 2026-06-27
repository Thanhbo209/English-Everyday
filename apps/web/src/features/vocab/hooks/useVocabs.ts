import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVocabSets,
  getVocabSetById,
  createVocabSet,
  updateVocabSet,
  deleteVocabSet,
  getVocabItems,
  createVocabItem,
  updateVocabItem,
  deleteVocabItem,
  reorderVocabItems,
  previewCsvImport,
  confirmCsvImport,
  uploadVocabItemImage,
  uploadVocabItemAudio,
} from "../../../api/vocab.api";
import type {
  CreateVocabSetPayload,
  UpdateVocabSetPayload,
  CreateVocabItemPayload,
  UpdateVocabItemPayload,
  ReorderItemInput,
} from "../../../api/vocab.api";

export function useVocabSets(classroomId?: string) {
  return useQuery({
    queryKey: ["vocab-sets", classroomId],
    queryFn: () => getVocabSets(classroomId),
  });
}

export function useVocabSet(id: string) {
  return useQuery({
    queryKey: ["vocab-set", id],
    queryFn: () => getVocabSetById(id),
    enabled: !!id,
  });
}

export function useCreateVocabSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVocabSetPayload) => createVocabSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
    },
  });
}

export function useUpdateVocabSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVocabSetPayload }) =>
      updateVocabSet(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-set", variables.id] });
    },
  });
}

export function useDeleteVocabSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVocabSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
    },
  });
}

export function useVocabItems(setId: string) {
  return useQuery({
    queryKey: ["vocab-items", setId],
    queryFn: () => getVocabItems(setId),
    enabled: !!setId,
  });
}

export function useCreateVocabItem(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVocabItemPayload) => createVocabItem(setId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
    },
  });
}

export function useUpdateVocabItem(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateVocabItemPayload }) =>
      updateVocabItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
    },
  });
}

export function useDeleteVocabItem(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => deleteVocabItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
    },
  });
}

export function useReorderVocabItems(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderItemInput[]) => reorderVocabItems(setId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
    },
  });
}

export function useCsvImportPreview(setId: string) {
  return useMutation({
    mutationFn: (file: File) => previewCsvImport(setId, file),
  });
}

export function useConfirmCsvImport(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => confirmCsvImport(setId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
      queryClient.invalidateQueries({ queryKey: ["vocab-sets"] });
    },
  });
}

export function useUploadImage(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      uploadVocabItemImage(itemId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
    },
  });
}

export function useUploadAudio(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      uploadVocabItemAudio(itemId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocab-items", setId] });
    },
  });
}
