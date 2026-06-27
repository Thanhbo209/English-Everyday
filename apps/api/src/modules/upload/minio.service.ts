import { Client as MinioClient } from "minio";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

/**
 * Thin wrapper around the MinIO client.
 *
 * The bucket name is read from the MINIO_BUCKET environment variable so it
 * stays out of application code.  The MinioClient instance is provided by
 * the existing Fastify MinIO plugin (app.minio) and passed in at construction
 * time — no second client is created.
 */
export class MinioService {
  private readonly bucket: string;

  constructor(private readonly client: MinioClient) {
    const bucket = process.env.MINIO_BUCKET;
    if (!bucket) {
      throw new Error("MINIO_BUCKET environment variable is not set");
    }
    this.bucket = bucket;
  }

  /**
   * Upload a buffer and return the public/presigned URL for the stored object.
   *
   * @param objectName  Full object path inside the bucket, e.g.
   *                    `vocab-items/abc123/image-1718000000000.jpg`
   * @param buffer      File contents.
   * @param contentType MIME type, e.g. `image/jpeg`.
   * @returns           The permanent object URL.
   */
  async upload(
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        buffer,
        buffer.byteLength,
        {
          "Content-Type": contentType,
        },
      );

      return this.buildUrl(objectName);
    } catch (err: any) {
      if (err.code === "ECONNREFUSED" || err.message?.includes("connect")) {
        console.warn("MinIO is offline. Falling back to local disk storage.");
        return this.saveLocally(objectName, buffer);
      }
      throw err;
    }
  }

  /**
   * Delete an object by its path.  Silently succeeds when the object does not
   * exist (idempotent).
   */
  async delete(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectName);
    } catch (err: any) {
      if (err.code === "ECONNREFUSED" || err.message?.includes("connect")) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const uploadDir = path.resolve(__dirname, "../../../uploads");
        const filePath = path.join(uploadDir, objectName);
        await fs.unlink(filePath).catch(() => {});
        return;
      }
      throw err;
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async saveLocally(objectName: string, buffer: Buffer): Promise<string> {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadDir = path.resolve(__dirname, "../../../uploads");
    const filePath = path.join(uploadDir, objectName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    const apiPort = process.env.API_PORT ?? "3000";
    return `http://localhost:${apiPort}/uploads/${objectName}`;
  }

  private buildUrl(objectName: string): string {
    const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
    const port = process.env.MINIO_PORT ?? "9000";
    const useSSL = process.env.MINIO_USE_SSL === "true";
    const scheme = useSSL ? "https" : "http";

    return `${scheme}://${endpoint}:${port}/${this.bucket}/${objectName}`;
  }
}
