import { prisma } from "../../config/prisma.js";

export class MasteryRepository {
  findClassroomOwnership(classroomId: string, teacherId: string) {
    return prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
    });
  }

  findItemsForStudent(studentId: string, vocabSetId?: string) {
    return prisma.vocabItem.findMany({
      where: {
        ...(vocabSetId ? { setId: vocabSetId } : {}),
        vocabSet: {
          classroom: {
            classroomsMembers: {
              some: { studentId },
            },
          },
        },
      },
      include: {
        vocabSet: {
          select: {
            id: true,
            title: true,
          },
        },
        masteries: {
          where: { studentId },
        },
      },
      orderBy: [{ setId: "asc" }, { orderIndex: "asc" }],
    });
  }

  findMasteriesForClassroom(classroomId: string) {
    return prisma.vocabMastery.findMany({
      where: {
        vocabItem: {
          vocabSet: {
            classroomId,
          },
        },
      },
      include: {
        vocabItem: {
          select: {
            id: true,
            term: true,
            vocabSet: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
