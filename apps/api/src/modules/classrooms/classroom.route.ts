import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import {
  createClassroomController,
  deleteClassroomController,
  getClassById,
  getClassroomsController,
  getMembersController,
  joinClassroomController,
  updateClassroomController,
} from "./classroom.controller.js";

export async function classroomRoutes(app: any) {
  const { teacherPreHandler, authPreHandler, studentPreHandler } =
    middlewareHandler(app);

  app.get("/:id/members", { preHandler: authPreHandler }, getMembersController);
  app.get("/:id", { preHandler: authPreHandler }, getClassById);
  app.get("/", { preHandler: authPreHandler }, getClassroomsController);

  app.post("/", { preHandler: teacherPreHandler }, createClassroomController);
  app.post("/join", { preHandler: studentPreHandler }, joinClassroomController);

  app.patch(
    "/:id",
    {
      preHandler: teacherPreHandler,
    },
    updateClassroomController,
  );

  app.delete(
    "/:id",
    {
      preHandler: teacherPreHandler,
    },
    deleteClassroomController,
  );
}
