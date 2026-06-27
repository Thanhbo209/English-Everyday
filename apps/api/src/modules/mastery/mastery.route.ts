import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { MasteryController } from "./mastery.controller";
import { MasteryRepository } from "./mastery.repository";
import { MasteryService } from "./mastery.service";

export async function masteryRoutes(app: any): Promise<void> {
  const repository = new MasteryRepository();
  const service = new MasteryService(repository);
  const controller = new MasteryController(service);
  const { studentPreHandler, teacherPreHandler } = middlewareHandler(app);

  app.get("/me", { preHandler: studentPreHandler }, controller.getMe);
  app.get("/me/:vocabSetId", { preHandler: studentPreHandler }, controller.getMeByVocabSet);
  app.get("/classroom/:id", { preHandler: teacherPreHandler }, controller.getClassroomMastery);
}
