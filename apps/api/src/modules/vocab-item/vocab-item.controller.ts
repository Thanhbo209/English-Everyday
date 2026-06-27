import { FastifyRequest, FastifyReply } from "fastify";
import { VocabItemService } from "./vocab-item.service";
import {
  CreateVocabItemSchema,
  UpdateVocabItemSchema,
  VocabItemParamsSchema,
  VocabSetItemParamsSchema,
  ReorderItemsSchema,
} from "./vocab-item.schema";
import { AppError, ErrorCode } from "../../shared/errors/app.error";

export class VocabItemController {
  constructor(private readonly service: VocabItemService) {}

  getItems = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id: setId } = VocabSetItemParamsSchema.parse(request.params);
    const items = await this.service.getItems(setId, request.user.id);
    reply.status(200).send(items);
  };

  createItem = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id: setId } = VocabSetItemParamsSchema.parse(request.params);
    const body = CreateVocabItemSchema.parse(request.body);
    const item = await this.service.createItem(setId, request.user.id, body);
    reply.status(201).send(item);
  };

  updateItem = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabItemParamsSchema.parse(request.params);
    const body = UpdateVocabItemSchema.parse(request.body);
    const item = await this.service.updateItem(id, request.user.id, body);
    reply.status(200).send(item);
  };

  deleteItem = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabItemParamsSchema.parse(request.params);
    await this.service.deleteItem(id, request.user.id);
    reply.status(204).send();
  };

  // ── Phase 3: Reorder ──────────────────────────────────────────────────────

  reorderItems = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id: setId } = VocabSetItemParamsSchema.parse(request.params);
    const body = ReorderItemsSchema.parse(request.body);
    await this.service.reorderItems(setId, request.user.id, body);
    reply.status(200).send({ message: "Order updated" });
  };

  // ── Phase 4: CSV Import ───────────────────────────────────────────────────

  previewCsvImport = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id: setId } = VocabSetItemParamsSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "No file uploaded");
    }
    const buffer = await file.toBuffer();
    const result = await this.service.previewCsvImport(
      setId,
      request.user.id,
      buffer,
    );
    reply.status(200).send(result);
  };

  confirmCsvImport = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id: setId } = VocabSetItemParamsSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "No file uploaded");
    }
    const buffer = await file.toBuffer();
    const items = await this.service.confirmCsvImport(
      setId,
      request.user.id,
      buffer,
    );
    reply.status(201).send(items);
  };

  // ── Phase 5: File Upload ──────────────────────────────────────────────────

  uploadImage = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabItemParamsSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "No file uploaded");
    }
    const item = await this.service.uploadImage(id, request.user.id, file);
    reply.status(200).send(item);
  };

  uploadAudio = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabItemParamsSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "No file uploaded");
    }
    const item = await this.service.uploadAudio(id, request.user.id, file);
    reply.status(200).send(item);
  };
}
