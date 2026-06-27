import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "../../infrastructure/prisma/generated/prisma/enums";

export function authorize(...roles: UserRole[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        code: "FORBIDDEN",
        message: "You are not allowed to perform this action.",
      });
    }
  };
}
