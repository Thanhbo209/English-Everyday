import { prisma } from "../../config/prisma.js";
import {
  CreateAssignmentInput,
  AssignmentQueryInput,
  UpdateAssignmentInput,
} from "./assignment.schema";

export class AssignmentRepository {
  findAllByTeacher(teacherId: string, query: AssignmentQueryInput) {
    return prisma.assignment.findMany({
      where: {
        teacherId,
        ...(query.classroomId ? { classroomId: query.classroomId } : {}),
        ...(query.vocabSetId ? { vocabSetId: query.vocabSetId } : {}),
      },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findStudentAssignments(studentId: string) {
    return prisma.assignment.findMany({
      where: {
        classroom: {
          classroomsMembers: {
            some: { studentId },
          },
        },
      },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: {
          include: {
            _count: { select: { vocabItems: true } },
          },
        },
        submissions: {
          where: { studentId },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    });
  }

  findById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        classroom: true,
        vocabSet: {
          include: {
            vocabItems: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        _count: { select: { submissions: true } },
      },
    });
  }

  create(teacherId: string, data: CreateAssignmentInput) {
    return prisma.assignment.create({
      data: {
        classroomId: data.classroomId,
        teacherId,
        title: data.title,
        activityType: data.activityType,
        vocabSetId: data.vocabSetId,
        config: data.config,
        dueAt: data.dueAt,
      },
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
      },
    });
  }

  update(id: string, data: UpdateAssignmentInput) {
    return prisma.assignment.update({
      where: { id },
      data,
      include: {
        classroom: { select: { id: true, name: true } },
        vocabSet: { select: { id: true, title: true, language: true } },
      },
    });
  }

  delete(id: string) {
    return prisma.assignment.delete({ where: { id } });
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
}
