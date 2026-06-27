import { VocabSetRepository } from "./vocab-set.repository";
import { VocabSetService } from "./vocab-set.service";
import { VocabSetController } from "./vocab-set.controller";
import { middlewareHandler } from "../../shared/middlewares/preHandlers";

export async function vocabSetRoutes(app: any): Promise<void> {
  const repository = new VocabSetRepository();
  const service = new VocabSetService(repository);
  const controller = new VocabSetController(service);

  const { teacherPreHandler, authPreHandler } = middlewareHandler(app);

  app.get("/", { preHandler: authPreHandler }, controller.getVocabularySets);
  app.post("/", { preHandler: teacherPreHandler }, controller.createVocabularySet);
  app.get("/:id", { preHandler: authPreHandler }, controller.getVocabularySet);
  app.patch("/:id", { preHandler: teacherPreHandler }, controller.updateVocabularySet);
  app.delete("/:id", { preHandler: teacherPreHandler }, controller.deleteVocabularySet);
}
