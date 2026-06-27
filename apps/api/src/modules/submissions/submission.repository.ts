import { prisma } from "../../config/prisma.js";
import { SubmitAssignmentInput } from "./submission.schema";

export type MasteryUpdateInput = {
  vocabItemId: string;
  status: "NEW" | "LEARNING" | "KNOWN";
};

export class SubmissionRepository {
  findAssignmentForStudent(assignmentId: string, studentId: string) {
    return prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        classroom: {
          classroomsMembers: {
            some: { studentId },
          },
        },
      },
      include: {
        vocabSet: {
          include: {
            vocabItems: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });
  }

  submitAssignment(
    assignment: {
      id: string;
      vocabSetId: string;
      activityType: any;
    },
    studentId: string,
    data: SubmitAssignmentInput,
    masteryUpdates: MasteryUpdateInput[],
  ) {
    return (prisma as any).$transaction(async (tx: any) => {
      const submission = await tx.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId,
          answers: data.answers,
          score: data.score,
          accuracy: data.accuracy,
          timeTakenSec: data.timeTakenSec,
          status: "SUBMITTED",
        },
      });

      const progressRecord = await tx.progressRecord.create({
        data: {
          studentId,
          vocabSetId: assignment.vocabSetId,
          activityType: assignment.activityType,
          score: data.score,
          accuracy: data.accuracy,
        },
      });

      for (const update of masteryUpdates) {
        await tx.vocabMastery.upsert({
          where: {
            studentId_vocabItemId: {
              studentId,
              vocabItemId: update.vocabItemId,
            },
          },
          create: {
            studentId,
            vocabItemId: update.vocabItemId,
            status: update.status,
            attempts: 1,
            lastSeenAt: new Date(),
          },
          update: {
            status: update.status,
            attempts: { increment: 1 },
            lastSeenAt: new Date(),
          },
        });
      }

      return { submission, progressRecord, masteryUpdated: masteryUpdates.length };
    });
  }
}
