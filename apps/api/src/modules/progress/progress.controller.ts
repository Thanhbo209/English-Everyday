import { FastifyReply, FastifyRequest } from "fastify";
import { ProgressService } from "./progress.service";
import { ProgressParamsSchema } from "./progress.schema";

export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const progress = await this.service.getProgress(request.user.id);
    reply.status(200).send(progress);
  };

  getMeByVocabSet = async (request: FastifyRequest, reply: FastifyReply) => {
    const { vocabSetId } = ProgressParamsSchema.parse(request.params);
    const progress = await this.service.getProgress(request.user.id, vocabSetId);
    reply.status(200).send(progress);
  };
}
