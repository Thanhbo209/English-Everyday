import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { SubmissionController } from "./submission.controller";
import { SubmissionRepository } from "./submission.repository";
import { SubmissionService } from "./submission.service";

export async function submissionRoutes(app: any): Promise<void> {
  const repository = new SubmissionRepository();
  const service = new SubmissionService(repository);
  const controller = new SubmissionController(service);
  const { studentPreHandler } = middlewareHandler(app);

  app.post("/:id/submit", { preHandler: studentPreHandler }, controller.submitAssignment);
}
