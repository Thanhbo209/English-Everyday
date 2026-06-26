import fp from "fastify-plugin";
import { prisma } from "../config/prisma";

export default fp(async (app) => {
  await prisma.$connect();

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
