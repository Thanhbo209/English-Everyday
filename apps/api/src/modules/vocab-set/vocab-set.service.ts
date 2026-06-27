import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { VocabSetRepository } from "./vocab-set.repository";
import {
  CreateVocabularySetInput,
  UpdateVocabularySetInput,
} from "./vocab-set.schema";

export class VocabSetService {
  constructor(private readonly repository: VocabSetRepository) {}

  async getVocabularySets(teacherId: string, classroomId?: string) {
    if (classroomId) {
      await this.ensureClassroomExists(classroomId);
      await this.ensureTeacherOwnsClassroom(classroomId, teacherId);
    }

    return this.repository.findAllByTeacher(teacherId, classroomId);
  }

  async getVocabularySet(id: string, teacherId: string) {
    const vocabSet = await this.repository.findById(id);

    if (!vocabSet) {
      throw new AppError(
        404,
        ErrorCode.VOCAB_NOT_FOUND,
        "Vocabulary set not found",
      );
    }

    if (vocabSet.teacherId !== teacherId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not own this vocabulary set",
      );
    }

    return vocabSet;
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

  async ensureVocabSetExistsAndOwned(id: string, teacherId: string) {
    const vocabSet = await this.repository.findById(id);

    if (!vocabSet) {
      throw new AppError(
        404,
        ErrorCode.VOCAB_NOT_FOUND,
        "Vocabulary set not found",
      );
    }

    if (vocabSet.teacherId !== teacherId) {
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
