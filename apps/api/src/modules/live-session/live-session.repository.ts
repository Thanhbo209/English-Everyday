import { prisma } from "../../config/prisma.js";
import {
  CreateLiveSessionInput,
  SubmitLiveSessionInput,
  UpdateLiveSessionInput,
} from "./live-session.schema";

export class LiveSessionRepository {
  findAllForTeacher(teacherId: string) {
    return prisma.liveSession.findMany({
      where: { teacherId },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
        _count: { select: { players: true } },
      },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    });
  }

  findAllForStudent(studentId: string) {
    return prisma.liveSession.findMany({
      where: {
        classroom: {
          classroomsMembers: {
            some: { studentId },
          },
        },
      },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
        players: {
          where: { studentId },
        },
        _count: { select: { players: true } },
      },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    });
  }

  findById(id: string) {
    return prisma.liveSession.findUnique({
      where: { id },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: {
          include: {
            vocabItems: { orderBy: { orderIndex: "asc" } },
          },
        },
        players: {
          include: {
            student: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
        },
      },
    });
  }

  findByPin(pin: string) {
    return prisma.liveSession.findUnique({
      where: { pin },
      include: {
        classroom: true,
      },
    });
  }

  create(teacherId: string, pin: string, data: CreateLiveSessionInput) {
    return prisma.liveSession.create({
      data: {
        classroomId: data.classroomId,
        teacherId,
        activityType: data.activityType,
        vocabSetId: data.vocabSetId,
        config: data.config,
        pin,
      },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
      },
    });
  }

  update(id: string, data: UpdateLiveSessionInput) {
    const now = new Date();
    return prisma.liveSession.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === "ACTIVE" ? { startedAt: now } : {}),
        ...(data.status === "ENDED" ? { endedAt: now } : {}),
      },
    });
  }

  delete(id: string) {
    return prisma.liveSession.delete({ where: { id } });
  }

  findClassroomOwnership(classroomId: string, teacherId: string) {
    return prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
    });
  }

  findVocabSetOwnership(vocabSetId: string, teacherId: string) {
    return prisma.vocabularySet.findFirst({
      where: { id: vocabSetId, teacherId },
    });
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

  join(sessionId: string, studentId: string) {
    return prisma.liveSessionPlayer.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
      create: {
        sessionId,
        studentId,
      },
      update: {},
      include: {
        session: true,
      },
    });
  }

  submit(sessionId: string, studentId: string, data: SubmitLiveSessionInput) {
    return (prisma as any).$transaction(async (tx: any) => {
      await tx.liveSessionPlayer.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
        create: {
          sessionId,
          studentId,
          score: data.score,
          answers: data.answers,
        },
        update: {
          score: data.score,
          answers: data.answers,
        },
      });

      const players = await tx.liveSessionPlayer.findMany({
        where: { sessionId },
        orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
        include: {
          student: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      for (let index = 0; index < players.length; index += 1) {
        await tx.liveSessionPlayer.update({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: players[index].studentId,
            },
          },
          data: { rank: index + 1 },
        });
      }

      const entries = players.map((player: any, index: number) => ({
        studentId: player.studentId,
        name: player.student.name,
        avatarUrl: player.student.avatarUrl,
        score: player.score,
        rank: index + 1,
      }));

      await tx.liveSession.update({
        where: { id: sessionId },
        data: { scores: entries },
      });

      return entries;
    });
  }

  leaderboard(sessionId: string) {
    return prisma.liveSessionPlayer.findMany({
      where: { sessionId },
      include: {
        student: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ score: "desc" }, { joinedAt: "asc" }],
    });
  }
}
