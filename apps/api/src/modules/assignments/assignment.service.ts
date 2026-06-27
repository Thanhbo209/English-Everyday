import { ActivityType } from "../../infrastructure/prisma/generated/prisma/enums.js";
import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { AssignmentRepository } from "./assignment.repository";
import {
  AssignmentQueryInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./assignment.schema";

export class AssignmentService {
  constructor(private readonly repository: AssignmentRepository) {}

  getAssignments(teacherId: string, query: AssignmentQueryInput) {
    return this.repository.findAllByTeacher(teacherId, query);
  }

  getStudentAssignments(studentId: string) {
    return this.repository.findStudentAssignments(studentId);
  }

  async getTeacherAssignment(id: string, teacherId: string) {
    const assignment = await this.ensureAssignmentForTeacher(id, teacherId);
    return assignment;
  }

  async getStudentAssignment(id: string, studentId: string) {
    const assignment = await this.repository.findById(id);

    if (!assignment) {
      throw new AppError(
        404,
        ErrorCode.ASSIGNMENT_NOT_FOUND,
        "Assignment not found",
      );
    }

    const membership = await this.repository.findMembership(
      assignment.classroomId,
      studentId,
    );

    if (!membership) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You are not enrolled in this assignment's classroom",
      );
    }

    return assignment;
  }

  async createAssignment(teacherId: string, data: CreateAssignmentInput) {
    await this.ensureTeacherOwnsClassroom(data.classroomId, teacherId);
    const vocabSet = await this.ensureTeacherOwnsVocabSet(
      data.vocabSetId,
      teacherId,
    );

    if (vocabSet.classroomId !== data.classroomId) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Vocabulary set must belong to the assignment classroom",
      );
    }

    return this.repository.create(teacherId, data);
  }

  async updateAssignment(
    id: string,
    teacherId: string,
    data: UpdateAssignmentInput,
  ) {
    const assignment = await this.ensureAssignmentForTeacher(id, teacherId);

    if (data.vocabSetId) {
      const vocabSet = await this.ensureTeacherOwnsVocabSet(
        data.vocabSetId,
        teacherId,
      );
      if (vocabSet.classroomId !== assignment.classroomId) {
        throw new AppError(
          400,
          ErrorCode.VALIDATION_ERROR,
          "Vocabulary set must belong to the assignment classroom",
        );
      }
    }

    return this.repository.update(id, data);
  }

  async deleteAssignment(id: string, teacherId: string) {
    await this.ensureAssignmentForTeacher(id, teacherId);
    await this.repository.delete(id);
  }

  async ensureAssignmentForStudent(id: string, studentId: string) {
    return this.getStudentAssignment(id, studentId);
  }

  private async ensureAssignmentForTeacher(id: string, teacherId: string) {
    const assignment = await this.repository.findById(id);

    if (!assignment) {
      throw new AppError(
        404,
        ErrorCode.ASSIGNMENT_NOT_FOUND,
        "Assignment not found",
      );
    }

    if (assignment.teacherId !== teacherId) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You do not own this assignment",
      );
    }

    return assignment;
  }

  private async ensureTeacherOwnsClassroom(
    classroomId: string,
    teacherId: string,
  ) {
    const classroom = await this.repository.findClassroomOwnership(
      classroomId,
      teacherId,
    );

    if (!classroom) {
      throw new AppError(
        404,
        ErrorCode.CLASSROOM_NOT_FOUND,
        "Classroom not found",
      );
    }
  }

  private async ensureTeacherOwnsVocabSet(vocabSetId: string, teacherId: string) {
    const vocabSet = await this.repository.findVocabSetOwnership(
      vocabSetId,
      teacherId,
    );

    if (!vocabSet) {
      throw new AppError(
        404,
        ErrorCode.VOCAB_NOT_FOUND,
        "Vocabulary set not found",
      );
    }

    return vocabSet;
  }
}

export type AssignmentActivityType = ActivityType;
