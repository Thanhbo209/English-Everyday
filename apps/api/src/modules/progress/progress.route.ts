import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { ProgressController } from "./progress.controller";
import { ProgressRepository } from "./progress.repository";
import { ProgressService } from "./progress.service";

export async function progressRoutes(app: any): Promise<void> {
  const repository = new ProgressRepository();
  const service = new ProgressService(repository);
  const controller = new ProgressController(service);
  const { studentPreHandler } = middlewareHandler(app);

  app.get("/me", { preHandler: studentPreHandler }, controller.getMe);
  app.get("/me/:vocabSetId", { preHandler: studentPreHandler }, controller.getMeByVocabSet);
}
