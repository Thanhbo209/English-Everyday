import { middlewareHandler } from "../../shared/middlewares/preHandlers.js";
import {
  getMeController,
  loginController,
  registerController,
} from "./auth.controller.js";

export default async function authRoutes(app: any) {
  const { authPreHandler } = middlewareHandler(app);
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.get("/me", { preHandler: authPreHandler }, getMeController);
}
