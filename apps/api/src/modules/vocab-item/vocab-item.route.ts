import { VocabItemRepository } from "./vocab-item.repository";
import { VocabSetRepository } from "../vocab-set/vocab-set.repository";
import { VocabSetService } from "../vocab-set/vocab-set.service";
import { VocabItemService } from "./vocab-item.service";
import { VocabItemController } from "./vocab-item.controller";
import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { CsvService } from "../csv/csv.service";
import { VocabUploadService } from "../upload/vocab-upload.service";
import { MinioService } from "../upload/minio.service";

export async function vocabItemRoutes(app: any): Promise<void> {
  const vocabSetRepository = new VocabSetRepository();
  const vocabSetService = new VocabSetService(vocabSetRepository);

  const vocabItemRepository = new VocabItemRepository();
  const csvService = new CsvService();
  const uploadService = new VocabUploadService(new MinioService(app.minio));

  const vocabItemService = new VocabItemService(
    vocabItemRepository,
    vocabSetService,
    csvService,
    uploadService,
  );

  const controller = new VocabItemController(vocabItemService);

  const { teacherPreHandler, authPreHandler } = middlewareHandler(app);

  // Phase 2 — Item CRUD
  app.get("/vocab-sets/:id/items", { preHandler: authPreHandler }, controller.getItems);
  app.post(
    "/vocab-sets/:id/items",
    { preHandler: teacherPreHandler },
    controller.createItem,
  );
  app.patch("/vocab-items/:id", { preHandler: teacherPreHandler }, controller.updateItem);
  app.delete("/vocab-items/:id", { preHandler: teacherPreHandler }, controller.deleteItem);

  // Phase 3 — Reorder
  app.patch(
    "/vocab-sets/:id/reorder",
    { preHandler: teacherPreHandler },
    controller.reorderItems,
  );

  // Phase 4 — CSV Import
  app.post(
    "/vocab-sets/:id/import/preview",
    { preHandler: teacherPreHandler },
    controller.previewCsvImport,
  );
  app.post(
    "/vocab-sets/:id/import",
    { preHandler: teacherPreHandler },
    controller.confirmCsvImport,
  );

  // Phase 5 — MinIO Upload
  app.post(
    "/vocab-items/:id/image",
    { preHandler: teacherPreHandler },
    controller.uploadImage,
  );
  app.post(
    "/vocab-items/:id/audio",
    { preHandler: teacherPreHandler },
    controller.uploadAudio,
  );
}
