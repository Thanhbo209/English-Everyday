import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { VocabSetRepository } from "./vocab-set.repository";
import { prisma } from "../../config/prisma.js";
import {
  CreateVocabularySetInput,
  UpdateVocabularySetInput,
} from "./vocab-set.schema";

export class VocabSetService {
  constructor(private readonly repository: VocabSetRepository) {}

  async getVocabularySets(userId: string, userRole?: string, classroomId?: string) {
    if (userRole === "STUDENT") {
      return this.repository.findAllByStudent(userId, classroomId);
    }

    if (classroomId) {
      await this.ensureClassroomExists(classroomId);
      await this.ensureTeacherOwnsClassroom(classroomId, userId);
    }

    return this.repository.findAllByTeacher(userId, classroomId);
  }

  async getVocabularySet(id: string, userId: string, userRole?: string) {
    await this.ensureVocabSetExistsAndOwned(id, userId, userRole);
    return this.repository.findById(id);
  }

  async createVocabularySet(teacherId: string, data: CreateVocabularySetInput) {
    await this.ensureClassroomExists(data.classroomId);
    await this.ensureTeacherOwnsClassroom(data.classroomId, teacherId);

    return this.repository.create(teacherId, data);
  }

  async updateVocabularySet(
    id: string,
    teacherId: string,
    data: UpdateVocabularySetInput,
  ) {
    await this.ensureVocabSetExistsAndOwned(id, teacherId);

    return this.repository.update(id, data);
  }

  async deleteVocabularySet(id: string, teacherId: string): Promise<void> {
    await this.ensureVocabSetExistsAndOwned(id, teacherId);

    await this.repository.delete(id);
  }

  // ── Shared guard — public so VocabItemService can call it ─────────────────

  async ensureVocabSetExistsAndOwned(id: string, userId: string, userRole?: string) {
    const vocabSet = await this.repository.findById(id);

    if (!vocabSet) {
      throw new AppError(
        404,
        ErrorCode.VOCAB_NOT_FOUND,
        "Vocabulary set not found",
      );
    }

    if (userRole === "STUDENT") {
      const isMember = await prisma.classroomsMember.findFirst({
        where: {
          classroomId: vocabSet.classroomId,
          studentId: userId,
        },
      });
      if (!isMember) {
        throw new AppError(
          403,
          ErrorCode.FORBIDDEN,
          "You are not enrolled in this vocabulary set's classroom",
        );
      }
      return;
    }

    if (vocabSet.teacherId !== userId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not own this vocabulary set",
      );
    }

    return vocabSet;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async ensureClassroomExists(classroomId: string): Promise<void> {
    const classroom = await this.repository.findClassroom(classroomId);

    if (!classroom) {
      throw new AppError(
        404,
        ErrorCode.CLASSROOM_NOT_FOUND,
        "Classroom not found",
      );
    }
  }

  private async ensureTeacherOwnsClassroom(
    classroomId: string,
    teacherId: string,
  ): Promise<void> {
    const owned = await this.repository.findTeacherOwnership(
      classroomId,
      teacherId,
    );

    if (!owned) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not own this classroom",
      );
    }
  }
}
