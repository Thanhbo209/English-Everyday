import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { AssignmentController } from "./assignment.controller";
import { AssignmentRepository } from "./assignment.repository";
import { AssignmentService } from "./assignment.service";

export async function assignmentRoutes(app: any): Promise<void> {
  const repository = new AssignmentRepository();
  const service = new AssignmentService(repository);
  const controller = new AssignmentController(service);
  const { teacherPreHandler } = middlewareHandler(app);

  app.get("/", { preHandler: teacherPreHandler }, controller.getAssignments);
  app.post("/", { preHandler: teacherPreHandler }, controller.createAssignment);
  app.get("/:id", { preHandler: teacherPreHandler }, controller.getAssignment);
  app.patch("/:id", { preHandler: teacherPreHandler }, controller.updateAssignment);
  app.delete("/:id", { preHandler: teacherPreHandler }, controller.deleteAssignment);
}

export async function studentAssignmentRoutes(app: any): Promise<void> {
  const repository = new AssignmentRepository();
  const service = new AssignmentService(repository);
  const controller = new AssignmentController(service);
  const { studentPreHandler } = middlewareHandler(app);

  app.get("/", { preHandler: studentPreHandler }, controller.getStudentAssignments);
  app.get("/:id", { preHandler: studentPreHandler }, controller.getStudentAssignment);
}
