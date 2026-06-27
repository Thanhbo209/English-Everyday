import { FastifyRequest, FastifyReply } from "fastify";
import { VocabSetService } from "./vocab-set.service";
import {
  CreateVocabularySetSchema,
  UpdateVocabularySetSchema,
  VocabularySetParamsSchema,
  VocabularySetQuerySchema,
} from "./vocab-set.schema";

export class VocabSetController {
  constructor(private readonly service: VocabSetService) {}

  getVocabularySets = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const query = VocabularySetQuerySchema.parse(request.query);
    const sets = await this.service.getVocabularySets(
      request.user.id,
      request.user.role,
      query.classroomId,
    );

    reply.status(200).send(sets);
  };

  getVocabularySet = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabularySetParamsSchema.parse(request.params);
    const vocabSet = await this.service.getVocabularySet(id, request.user.id, request.user.role);

    reply.status(200).send(vocabSet);
  };

  createVocabularySet = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const body = CreateVocabularySetSchema.parse(request.body);
    const teacherId = request.user.id;

    const vocabSet = await this.service.createVocabularySet(teacherId, body);

    reply.status(201).send(vocabSet);
  };

  updateVocabularySet = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabularySetParamsSchema.parse(request.params);
    const body = UpdateVocabularySetSchema.parse(request.body);
    const teacherId = request.user.id;

    const vocabSet = await this.service.updateVocabularySet(
      id,
      teacherId,
      body,
    );

    reply.status(200).send(vocabSet);
  };

  deleteVocabularySet = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = VocabularySetParamsSchema.parse(request.params);
    const teacherId = request.user.id;

    await this.service.deleteVocabularySet(id, teacherId);

    reply.status(204).send();
  };
}
