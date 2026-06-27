import { MultipartFile } from "@fastify/multipart";
import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { MinioService } from "./minio.service";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_AUDIO_TYPES = new Set(["audio/mpeg", "audio/wav", "audio/webm"]);

const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const AUDIO_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export class VocabUploadService {
  constructor(private readonly minio: MinioService) {}

  async uploadImage(vocabItemId: string, file: MultipartFile): Promise<string> {
    this.validateMimeType(
      file.mimetype,
      ALLOWED_IMAGE_TYPES,
      "Image must be jpg, png, or webp",
    );

    const buffer = await file.toBuffer();
    this.validateSize(buffer, IMAGE_MAX_BYTES, "Image exceeds 5 MB limit");

    const ext = this.extensionFromMime(file.mimetype);
    const objectName = `vocab-items/${vocabItemId}/image-${Date.now()}.${ext}`;

    return this.minio.upload(objectName, buffer, file.mimetype);
  }

  async uploadAudio(vocabItemId: string, file: MultipartFile): Promise<string> {
    this.validateMimeType(
      file.mimetype,
      ALLOWED_AUDIO_TYPES,
      "Audio must be mp3, wav, or webm",
    );

    const buffer = await file.toBuffer();
    this.validateSize(buffer, AUDIO_MAX_BYTES, "Audio exceeds 20 MB limit");

    const ext = this.extensionFromMime(file.mimetype);
    const objectName = `vocab-items/${vocabItemId}/audio-${Date.now()}.${ext}`;

    return this.minio.upload(objectName, buffer, file.mimetype);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private validateMimeType(
    mimetype: string,
    allowed: Set<string>,
    message: string,
  ): void {
    if (!allowed.has(mimetype)) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, message);
    }
  }

  private validateSize(
    buffer: Buffer,
    maxBytes: number,
    message: string,
  ): void {
    if (buffer.byteLength > maxBytes) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, message);
    }
  }

  private extensionFromMime(mimetype: string): string {
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "audio/webm": "webm",
    };
    return map[mimetype] ?? "bin";
  }
}
