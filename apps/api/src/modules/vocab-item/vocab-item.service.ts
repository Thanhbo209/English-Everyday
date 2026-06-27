import { MultipartFile } from "@fastify/multipart";
import { VocabItem } from "../../infrastructure/prisma/generated/prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { VocabItemRepository } from "./vocab-item.repository";
import { VocabSetService } from "../vocab-set/vocab-set.service";
import { CsvService, CsvPreviewResult } from "../csv/csv.service";
import { VocabUploadService } from "../upload/vocab-upload.service";
import {
  CreateVocabItemInput,
  UpdateVocabItemInput,
  ReorderItemsInput,
} from "./vocab-item.schema";

export class VocabItemService {
  constructor(
    private readonly repository: VocabItemRepository,
    private readonly vocabSetService: VocabSetService,
    private readonly csvService: CsvService,
    private readonly uploadService: VocabUploadService,
  ) {}

  // ── Phase 2: Item CRUD ────────────────────────────────────────────────────

  async getItems(setId: string, teacherId: string): Promise<VocabItem[]> {
    await this.vocabSetService.ensureVocabSetExistsAndOwned(setId, teacherId);
    return this.repository.findBySetId(setId);
  }

  async createItem(
    setId: string,
    teacherId: string,
    data: CreateVocabItemInput,
  ): Promise<VocabItem> {
    await this.vocabSetService.ensureVocabSetExistsAndOwned(setId, teacherId);
    const nextIndex = await this.repository.countBySetId(setId);
    return this.repository.create(setId, nextIndex, data);
  }

  async updateItem(
    itemId: string,
    teacherId: string,
    data: UpdateVocabItemInput,
  ): Promise<VocabItem> {
    const item = await this.ensureItemExistsAndOwned(itemId, teacherId);
    return this.repository.update(item.id, data);
  }

  async deleteItem(itemId: string, teacherId: string): Promise<void> {
    const item = await this.ensureItemExistsAndOwned(itemId, teacherId);
    await this.repository.delete(item.id);
  }

  // ── Phase 3: Reorder ──────────────────────────────────────────────────────

  async reorderItems(
    setId: string,
    teacherId: string,
    data: ReorderItemsInput,
  ): Promise<void> {
    await this.vocabSetService.ensureVocabSetExistsAndOwned(setId, teacherId);

    const existingItems = await this.repository.findBySetId(setId);
    const existingIds = new Set(existingItems.map((i) => i.id));

    for (const entry of data.items) {
      if (!existingIds.has(entry.id)) {
        throw new AppError(
          404,
          ErrorCode.VOCAB_ITEM_NOT_FOUND,
          `Vocab item ${entry.id} does not belong to this set`,
        );
      }
    }

    await (prisma as any).$transaction(
      async () => {
        await this.repository.updateOrder(data.items);
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );
  }

  // ── Phase 4: CSV Import ───────────────────────────────────────────────────

  async previewCsvImport(
    setId: string,
    teacherId: string,
    fileBuffer: Buffer,
  ): Promise<CsvPreviewResult> {
    await this.vocabSetService.ensureVocabSetExistsAndOwned(setId, teacherId);
    return this.csvService.parseCsv(fileBuffer);
  }

  async confirmCsvImport(
    setId: string,
    teacherId: string,
    fileBuffer: Buffer,
  ): Promise<VocabItem[]> {
    await this.vocabSetService.ensureVocabSetExistsAndOwned(setId, teacherId);
    const { valid } = this.csvService.parseCsv(fileBuffer);

    if (valid.length === 0) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "No valid rows found in CSV",
      );
    }

    const startIndex = await this.repository.countBySetId(setId);
    return this.repository.bulkCreate(setId, startIndex, valid);
  }

  // ── Phase 5: MinIO Upload ─────────────────────────────────────────────────

  async uploadImage(
    itemId: string,
    teacherId: string,
    file: MultipartFile,
  ): Promise<VocabItem> {
    const item = await this.ensureItemExistsAndOwned(itemId, teacherId);
    const imageUrl = await this.uploadService.uploadImage(item.id, file);
    return this.repository.updateImageUrl(item.id, imageUrl);
  }

  async uploadAudio(
    itemId: string,
    teacherId: string,
    file: MultipartFile,
  ): Promise<VocabItem> {
    const item = await this.ensureItemExistsAndOwned(itemId, teacherId);
    const audioUrl = await this.uploadService.uploadAudio(item.id, file);
    return this.repository.updateAudioUrl(item.id, audioUrl);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async ensureItemExistsAndOwned(
    itemId: string,
    teacherId: string,
  ): Promise<VocabItem> {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError(
        404,
        ErrorCode.VOCAB_ITEM_NOT_FOUND,
        "Vocab item not found",
      );
    }
    await this.vocabSetService.ensureVocabSetExistsAndOwned(
      item.setId,
      teacherId,
    );
    return item;
  }
}
