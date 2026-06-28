import { api } from "./axios";

export interface VocabSet {
  id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  language: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  classroom?: {
    id: string;
    name: string;
  };
  _count?: {
    vocabItems: number;
  };
}

export interface CreateVocabSetPayload {
  title: string;
  language: string;
  description?: string;
  classroomId: string;
}

export interface UpdateVocabSetPayload {
  title?: string;
  language?: string;
  description?: string;
}

export interface VocabItem {
  id: string;
  setId: string;
  term: string;
  definition: string;
  phonetic: string | null;
  partOfSpeech: string;
  exampleSentence: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabItemPayload {
  term: string;
  definition: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

export interface UpdateVocabItemPayload {
  term?: string;
  definition?: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

export interface ReorderItemInput {
  id: string;
  orderIndex: number;
}

export interface CsvPreviewRow {
  row: number;
  term?: string;
  definition?: string;
  phonetic?: string;
  valid: boolean;
  error?: string;
}

export interface CsvPreviewResult {
  valid: { term: string; definition: string; phonetic?: string }[];
  preview: CsvPreviewRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

// Vocab Set endpoints
export async function getVocabSets(classroomId?: string): Promise<VocabSet[]> {
  const response = await api.get<VocabSet[]>("/vocabsets", {
    params: classroomId ? { classroomId } : undefined,
  });
  return response.data;
}

export async function getVocabSetById(id: string): Promise<VocabSet> {
  const response = await api.get<VocabSet>(`/vocabsets/${id}`);
  return response.data;
}

export async function createVocabSet(payload: CreateVocabSetPayload): Promise<VocabSet> {
  const response = await api.post<VocabSet>("/vocabsets", payload);
  return response.data;
}

export async function updateVocabSet(id: string, payload: UpdateVocabSetPayload): Promise<VocabSet> {
  const response = await api.patch<VocabSet>(`/vocabsets/${id}`, payload);
  return response.data;
}

export async function deleteVocabSet(id: string): Promise<void> {
  await api.delete(`/vocabsets/${id}`);
}

// Vocab Item endpoints
export async function getVocabItems(setId: string): Promise<VocabItem[]> {
  const response = await api.get<VocabItem[]>(`/vocabitems/vocab-sets/${setId}/items`);
  return response.data;
}

export async function createVocabItem(setId: string, payload: CreateVocabItemPayload): Promise<VocabItem> {
  const response = await api.post<VocabItem>(`/vocabitems/vocab-sets/${setId}/items`, payload);
  return response.data;
}

export async function updateVocabItem(itemId: string, payload: UpdateVocabItemPayload): Promise<VocabItem> {
  const response = await api.patch<VocabItem>(`/vocabitems/vocab-items/${itemId}`, payload);
  return response.data;
}

export async function deleteVocabItem(itemId: string): Promise<void> {
  await api.delete(`/vocabitems/vocab-items/${itemId}`);
}

export async function reorderVocabItems(setId: string, items: ReorderItemInput[]): Promise<void> {
  await api.patch(`/vocabitems/vocab-sets/${setId}/reorder`, { items });
}

// CSV endpoints
export async function previewCsvImport(setId: string, file: File): Promise<CsvPreviewResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<CsvPreviewResult>(`/vocabitems/vocab-sets/${setId}/import/preview`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function confirmCsvImport(setId: string, file: File): Promise<VocabItem[]> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<VocabItem[]>(`/vocabitems/vocab-sets/${setId}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// Media upload endpoints
export async function uploadVocabItemImage(itemId: string, file: File): Promise<VocabItem> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<VocabItem>(`/vocabitems/vocab-items/${itemId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function uploadVocabItemAudio(itemId: string, file: File): Promise<VocabItem> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<VocabItem>(`/vocabitems/vocab-items/${itemId}/audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
