import { middlewareHandler } from "../../shared/middlewares/preHandlers";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardRepository } from "./leaderboard.repository";
import { LeaderboardService } from "./leaderboard.service";

export async function leaderboardRoutes(app: any): Promise<void> {
  const repository = new LeaderboardRepository();
  const service = new LeaderboardService(repository);
  const controller = new LeaderboardController(service);
  const { authPreHandler } = middlewareHandler(app);

  app.get("/classroom/:id", { preHandler: authPreHandler }, controller.getClassroomLeaderboard);
  app.get("/global", { preHandler: authPreHandler }, controller.getGlobalLeaderboard);
}
