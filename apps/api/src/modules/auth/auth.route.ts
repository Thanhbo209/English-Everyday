import {
  getMeController,
  loginController,
  registerController,
} from "./auth.controller.js";

export default async function authRoutes(app: any) {
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.get("/me", { preHandler: [app.authenticate] }, getMeController);
}
