import Fastify from "fastify";
import jwtPlugin from "./plugins/jwt.js";
import prismaPlugin from "./plugins/prisma.js";
import auth from "./plugins/auth.js";
import authRoutes from "./modules/auth/auth.route.js";
import { AppError } from "./shared/errors/app.error.js";
import cors from "@fastify/cors";
import { classroomRoutes } from "./modules/classrooms/classroom.route.js";

export default function buildApp() {
  const app = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    },
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  });

  app.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // Plugins
  app.register(prismaPlugin);
  app.register(jwtPlugin);
  app.register(auth);

  // Routes
  app.register(authRoutes, {
    prefix: "/api/auth",
  });
  app.register(classroomRoutes, {
    prefix: "/api/classrooms",
  });

  return app;
}
