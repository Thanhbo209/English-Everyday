import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/env";

export default fp(async (app) => {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
});
