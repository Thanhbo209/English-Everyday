import { UserRole } from "../../infrastructure/prisma/generated/prisma/enums";
import { authorize } from "../../shared/middlewares/authorize.js";
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
  app.get("/:id/members", getMembersController);
  app.get("/:id", { preHandler: [app.authenticate] }, getClassById);
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
    },
    getClassroomsController,
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, authorize(UserRole.TEACHER)],
    },
    createClassroomController,
  );
  app.post(
    "/join",
    {
      preHandler: [app.authenticate, authorize(UserRole.STUDENT)],
    },
    joinClassroomController,
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate, authorize(UserRole.TEACHER)],
    },
    updateClassroomController,
  );

  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate, authorize(UserRole.TEACHER)],
    },
    deleteClassroomController,
  );
}
