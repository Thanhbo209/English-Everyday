import { FastifyReply, FastifyRequest } from "fastify";
import { LiveSessionService } from "./live-session.service";
import {
  CreateLiveSessionSchema,
  JoinLiveSessionSchema,
  LiveSessionParamsSchema,
  SubmitLiveSessionSchema,
  UpdateLiveSessionSchema,
} from "./live-session.schema";

export class LiveSessionController {
  constructor(private readonly service: LiveSessionService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const sessions = await this.service.list(request.user.id, request.user.role);
    reply.status(200).send(sessions);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = CreateLiveSessionSchema.parse(request.body);
    const session = await this.service.create(request.user.id, body);
    reply.status(201).send(session);
  };

  get = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = LiveSessionParamsSchema.parse(request.params);
    const session = await this.service.get(id, request.user.id, request.user.role);
    reply.status(200).send(session);
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = LiveSessionParamsSchema.parse(request.params);
    const body = UpdateLiveSessionSchema.parse(request.body);
    const session = await this.service.update(id, request.user.id, body);
    reply.status(200).send(session);
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = LiveSessionParamsSchema.parse(request.params);
    await this.service.delete(id, request.user.id);
    reply.status(204).send();
  };

  join = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = JoinLiveSessionSchema.parse(request.body);
    const player = await this.service.join(request.user.id, body);
    reply.status(201).send(player);
  };

  submit = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = LiveSessionParamsSchema.parse(request.params);
    const body = SubmitLiveSessionSchema.parse(request.body);
    const leaderboard = await this.service.submit(id, request.user.id, body);
    reply.status(201).send({ leaderboard });
  };

  leaderboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = LiveSessionParamsSchema.parse(request.params);
    const leaderboard = await this.service.leaderboard(
      id,
      request.user.id,
      request.user.role,
    );
    reply.status(200).send(leaderboard);
  };
}
