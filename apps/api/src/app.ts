import Fastify from "fastify";
import jwtPlugin from "./plugins/jwt.js";
import prismaPlugin from "./plugins/prisma.js";
import auth from "./plugins/auth.js";
import authRoutes from "./modules/auth/auth.route.js";
import { AppError } from "./shared/errors/app.error.js";
import cors from "@fastify/cors";
import { classroomRoutes } from "./modules/classrooms/classroom.route.js";
import { vocabSetRoutes } from "./modules/vocab-set/vocab-set.route.js";
import { vocabItemRoutes } from "./modules/vocab-item/vocab-item.route.js";
import multipart from "@fastify/multipart";
import minioPlugin from "./plugins/minio.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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
  app.register(multipart);
  app.register(minioPlugin);

  // Routes
  app.register(authRoutes, {
    prefix: "/api/auth",
  });
  app.register(classroomRoutes, {
    prefix: "/api/classrooms",
  });
  app.register(vocabSetRoutes, {
    prefix: "/api/vocabsets",
  });

  app.register(vocabItemRoutes, {
    prefix: "/api/vocabitems",
  });

  // Local static file serving fallback for uploads when MinIO is down
  app.get("/uploads/*", async (request: any, reply: any) => {
    const wild = request.params["*"];
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.resolve(__dirname, "../uploads", wild);

    try {
      const buffer = await fs.readFile(filePath);

      let mime = "application/octet-stream";
      if (wild.endsWith(".jpg") || wild.endsWith(".jpeg")) mime = "image/jpeg";
      else if (wild.endsWith(".png")) mime = "image/png";
      else if (wild.endsWith(".webp")) mime = "image/webp";
      else if (wild.endsWith(".mp3")) mime = "audio/mpeg";
      else if (wild.endsWith(".wav")) mime = "audio/wav";
      else if (wild.endsWith(".webm")) mime = "audio/webm";

      reply.header("Content-Type", mime);
      return reply.send(buffer);
    } catch {
      return reply.status(404).send({ message: "File not found" });
    }
  });

  return app;
}
