import {
  CreateVocabularySetInput,
  UpdateVocabularySetInput,
} from "./vocab-set.schema";
import {
  Classroom,
  PrismaClient,
  VocabularySet,
} from "../../infrastructure/prisma/generated/prisma/client";

import { prisma } from "../../config/prisma.js";
export class VocabSetRepository {
  async findAllByTeacher(teacherId: string, classroomId?: string) {
    return prisma.vocabularySet.findMany({
      where: {
        teacherId,
        ...(classroomId ? { classroomId } : {}),
      },
      include: {
        classroom: true,
        _count: {
          select: { vocabItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<
    | (VocabularySet & {
        classroom: Classroom;
        teacher: { id: string; name: string; email: string };
      })
    | null
  > {
    return prisma.vocabularySet.findUnique({
      where: { id },
      include: {
        classroom: true,
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    }) as Promise<
      | (VocabularySet & {
          classroom: Classroom;
          teacher: { id: string; name: string; email: string };
        })
      | null
    >;
  }

  async create(
    teacherId: string,
    data: CreateVocabularySetInput,
  ): Promise<VocabularySet> {
    return prisma.vocabularySet.create({
      data: {
        title: data.title,
        language: data.language,
        description: data.description,
        classroomId: data.classroomId,
        teacherId,
      },
    });
  }

  async update(
    id: string,
    data: UpdateVocabularySetInput,
  ): Promise<VocabularySet> {
    return prisma.vocabularySet.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.vocabularySet.delete({ where: { id } });
  }

  async findClassroom(classroomId: string): Promise<Classroom | null> {
    return prisma.classroom.findUnique({ where: { id: classroomId } });
  }

  async findTeacherOwnership(
    classroomId: string,
    teacherId: string,
  ): Promise<Classroom | null> {
    return prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
    });
  }
}
