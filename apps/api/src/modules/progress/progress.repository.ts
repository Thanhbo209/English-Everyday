import { prisma } from "../../config/prisma.js";

export class ProgressRepository {
  findByStudent(studentId: string, vocabSetId?: string) {
    return prisma.progressRecord.findMany({
      where: {
        studentId,
        ...(vocabSetId ? { vocabSetId } : {}),
      },
      include: {
        vocabSet: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    });
  }
}
