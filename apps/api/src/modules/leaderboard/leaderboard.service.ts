import { UserRole } from "../../infrastructure/prisma/generated/prisma/enums.js";
import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { LeaderboardRepository } from "./leaderboard.repository";
import { LeaderboardPeriodInput } from "./leaderboard.schema";

export class LeaderboardService {
  constructor(private readonly repository: LeaderboardRepository) {}

  async getClassroomLeaderboard(
    classroomId: string,
    period: LeaderboardPeriodInput,
    userId: string,
    role: string,
  ) {
    const classroom = await this.repository.findClassroom(classroomId);
    if (!classroom) {
      throw new AppError(
        404,
        ErrorCode.CLASSROOM_NOT_FOUND,
        "Classroom not found",
      );
    }

    if (role === UserRole.TEACHER && classroom.teacherId !== userId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "You do not own this classroom");
    }

    if (role === UserRole.STUDENT) {
      const membership = await this.repository.findMembership(classroomId, userId);
      if (!membership) {
        throw new AppError(
          403,
          ErrorCode.FORBIDDEN,
          "You are not enrolled in this classroom",
        );
      }
    }

    return this.buildLeaderboard(classroomId, period);
  }

  getGlobalLeaderboard(period: LeaderboardPeriodInput) {
    return this.buildLeaderboard(undefined, period);
  }

  private async buildLeaderboard(
    classroomId: string | undefined,
    period: LeaderboardPeriodInput,
  ) {
    const submissions = await this.repository.findSubmissions(
      classroomId,
      this.resolveSince(period),
    );
    const totals = new Map<
      string,
      {
        studentId: string;
        name: string;
        avatarUrl: string;
        score: number;
        attempts: number;
        averageAccuracy: number;
      }
    >();

    for (const submission of submissions) {
      const existing = totals.get(submission.studentId);
      if (existing) {
        existing.score += submission.score;
        existing.averageAccuracy += submission.accuracy;
        existing.attempts += 1;
      } else {
        totals.set(submission.studentId, {
          studentId: submission.studentId,
          name: submission.student.name,
          avatarUrl: submission.student.avatarUrl,
          score: submission.score,
          attempts: 1,
          averageAccuracy: submission.accuracy,
        });
      }
    }

    return Array.from(totals.values())
      .map((entry) => ({
        ...entry,
        averageAccuracy: Math.round(entry.averageAccuracy / entry.attempts),
      }))
      .sort((a, b) => b.score - a.score || b.averageAccuracy - a.averageAccuracy)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  private resolveSince(period: LeaderboardPeriodInput) {
    const now = new Date();
    if (period === "WEEK") {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === "MONTH") {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return undefined;
  }
}
