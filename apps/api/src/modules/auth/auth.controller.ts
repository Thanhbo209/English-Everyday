import { FastifyReply, FastifyRequest } from "fastify";
import { getMe, login, register } from "./auth.service.js";
import { LoginPayload, RegisterPayload } from "./auth.schema.js";

export async function registerController(
  request: FastifyRequest<{ Body: RegisterPayload }>,
  reply: FastifyReply,
) {
  const user = await register(request.body);

  return reply.status(201).send(user);
}

export async function loginController(
  request: FastifyRequest<{ Body: LoginPayload }>,
  reply: FastifyReply,
) {
  const signIn = await login(request.body);

  return reply.send(signIn);
}

export async function getMeController(
  request: FastifyRequest<{ Body: LoginPayload }>,
  reply: FastifyReply,
) {
  const jwtUser = request.user as {
    id: string;
    role: string;
  };
  const user = await getMe(jwtUser.id);

  return reply.send(user);
}
