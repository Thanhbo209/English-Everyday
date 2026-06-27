import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { LiveSessionController } from "./live-session.controller";
import { LiveSessionRepository } from "./live-session.repository";
import { LiveSessionService } from "./live-session.service";

export async function liveSessionRoutes(app: any): Promise<void> {
  const repository = new LiveSessionRepository();
  const service = new LiveSessionService(repository);
  const controller = new LiveSessionController(service);
  const { teacherPreHandler, studentPreHandler, authPreHandler } =
    middlewareHandler(app);

  app.get("/", { preHandler: authPreHandler }, controller.list);
  app.post("/", { preHandler: teacherPreHandler }, controller.create);
  app.get("/:id", { preHandler: authPreHandler }, controller.get);
  app.patch("/:id", { preHandler: teacherPreHandler }, controller.update);
  app.delete("/:id", { preHandler: teacherPreHandler }, controller.delete);
  app.post("/join", { preHandler: studentPreHandler }, controller.join);
  app.post("/:id/submit", { preHandler: studentPreHandler }, controller.submit);
  app.get("/:id/leaderboard", { preHandler: authPreHandler }, controller.leaderboard);
}
