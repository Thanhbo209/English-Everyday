import { FastifyReply, FastifyRequest } from "fastify";
import { MasteryService } from "./mastery.service";
import { ClassroomMasteryParamsSchema, MasteryParamsSchema } from "./mastery.schema";

export class MasteryController {
  constructor(private readonly service: MasteryService) {}

  getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const mastery = await this.service.getMastery(request.user.id);
    reply.status(200).send(mastery);
  };

  getMeByVocabSet = async (request: FastifyRequest, reply: FastifyReply) => {
    const { vocabSetId } = MasteryParamsSchema.parse(request.params);
    const mastery = await this.service.getMastery(request.user.id, vocabSetId);
    reply.status(200).send(mastery);
  };

  getClassroomMastery = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = ClassroomMasteryParamsSchema.parse(request.params);
    const mastery = await this.service.getClassroomMastery(id, request.user.id);
    reply.status(200).send(mastery);
  };
}
