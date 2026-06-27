import fp from "fastify-plugin";
import { Client } from "minio";

declare module "fastify" {
  interface FastifyInstance {
    minio: Client;
  }
}

export default fp(async (app) => {
  const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY ?? "minioadmin";

  const minioClient = new Client({
    endPoint: endpoint,
    port: parseInt(port, 10),
    useSSL: useSSL,
    accessKey: accessKey,
    secretKey: secretKey,
  });

  app.decorate("minio", minioClient);
});
