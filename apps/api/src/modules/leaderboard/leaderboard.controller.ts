import { FastifyReply, FastifyRequest } from "fastify";
import { LeaderboardService } from "./leaderboard.service";
import {
  LeaderboardClassroomParamsSchema,
  LeaderboardQuerySchema,
} from "./leaderboard.schema";

export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  getClassroomLeaderboard = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = LeaderboardClassroomParamsSchema.parse(request.params);
    const { period } = LeaderboardQuerySchema.parse(request.query);
    const leaderboard = await this.service.getClassroomLeaderboard(
      id,
      period,
      request.user.id,
      request.user.role,
    );
    reply.status(200).send(leaderboard);
  };

  getGlobalLeaderboard = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { period } = LeaderboardQuerySchema.parse(request.query);
    const leaderboard = await this.service.getGlobalLeaderboard(period);
    reply.status(200).send(leaderboard);
  };
}
