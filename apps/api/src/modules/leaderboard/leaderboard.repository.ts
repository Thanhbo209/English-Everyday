import { prisma } from "../../config/prisma.js";
import { LeaderboardPeriodInput } from "./leaderboard.schema";

export class LeaderboardRepository {
  findClassroom(classroomId: string) {
    return prisma.classroom.findUnique({ where: { id: classroomId } });
  }

  findMembership(classroomId: string, studentId: string) {
    return prisma.classroomsMember.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });
  }

  findSubmissions(classroomId?: string, since?: Date) {
    return prisma.submission.findMany({
      where: {
        ...(since ? { submittedAt: { gte: since } } : {}),
        ...(classroomId
          ? {
              assignment: {
                classroomId,
              },
            }
          : {}),
      },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  createSnapshot(
    classroomId: string,
    period: LeaderboardPeriodInput,
    entries: unknown,
  ) {
    return prisma.leaderboardSnapshot.create({
      data: {
        classroomId,
        period,
        entries: entries as any,
      },
    });
  }
}
