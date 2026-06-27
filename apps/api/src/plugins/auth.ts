import fp from "fastify-plugin";
import { FastifyRequest } from "fastify";

export default fp(async (app) => {
  app.decorate("authenticate", async function (request: FastifyRequest) {
    await request.jwtVerify();
  });
});
