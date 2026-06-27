import { UserRole } from "../../infrastructure/prisma/generated/prisma/enums";
import { authorize } from "./authorize";

export const middlewareHandler = (app: any) => ({
  teacherPreHandler: [app.authenticate, authorize(UserRole.TEACHER)],

  studentPreHandler: [app.authenticate, authorize(UserRole.STUDENT)],

  authPreHandler: [app.authenticate],
});
