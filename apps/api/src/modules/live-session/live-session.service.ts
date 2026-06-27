import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { LiveSessionRepository } from "./live-session.repository";
import {
  CreateLiveSessionInput,
  JoinLiveSessionInput,
  SubmitLiveSessionInput,
  UpdateLiveSessionInput,
} from "./live-session.schema";

export class LiveSessionService {
  constructor(private readonly repository: LiveSessionRepository) {}

  list(userId: string, role: string) {
    if (role === "TEACHER") {
      return this.repository.findAllForTeacher(userId);
    }
    return this.repository.findAllForStudent(userId);
  }

  async create(teacherId: string, data: CreateLiveSessionInput) {
    await this.ensureTeacherOwnsClassroom(data.classroomId, teacherId);
    const vocabSet = await this.ensureTeacherOwnsVocabSet(
      data.vocabSetId,
      teacherId,
    );

    if (vocabSet.classroomId !== data.classroomId) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Vocabulary set must belong to the live session classroom",
      );
    }

    return this.repository.create(teacherId, this.createPin(), data);
  }

  async get(id: string, userId: string, role: string) {
    const session = await this.ensureSessionExists(id);

    if (role === "TEACHER" && session.teacherId !== userId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "You do not own this session");
    }

    if (role === "STUDENT") {
      await this.ensureStudentCanAccess(session.classroomId, userId);
    }

    return session;
  }

  async update(id: string, teacherId: string, data: UpdateLiveSessionInput) {
    const session = await this.ensureSessionExists(id);
    if (session.teacherId !== teacherId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "You do not own this session");
    }
    return this.repository.update(id, data);
  }

  async delete(id: string, teacherId: string) {
    const session = await this.ensureSessionExists(id);
    if (session.teacherId !== teacherId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "You do not own this session");
    }
    await this.repository.delete(id);
  }

  async join(studentId: string, data: JoinLiveSessionInput) {
    const session = await this.repository.findByPin(data.pin);
    if (!session) {
      throw new AppError(
        404,
        ErrorCode.LIVE_SESSION_NOT_FOUND,
        "Live session not found",
      );
    }

    if (session.status === "ENDED") {
      throw new AppError(
        400,
        ErrorCode.LIVE_SESSION_ENDED,
        "This live session has ended",
      );
    }

    await this.ensureStudentCanAccess(session.classroomId, studentId);
    return this.repository.join(session.id, studentId);
  }

  async submit(id: string, studentId: string, data: SubmitLiveSessionInput) {
    const session = await this.ensureSessionExists(id);
    await this.ensureStudentCanAccess(session.classroomId, studentId);

    if (session.status !== "ACTIVE") {
      throw new AppError(
        400,
        ErrorCode.LIVE_SESSION_NOT_ACTIVE,
        "Live session is not active",
      );
    }

    return this.repository.submit(id, studentId, data);
  }

  async leaderboard(id: string, userId: string, role: string) {
    const session = await this.ensureSessionExists(id);
    if (role === "TEACHER" && session.teacherId !== userId) {
      throw new AppError(403, ErrorCode.FORBIDDEN, "You do not own this session");
    }
    if (role === "STUDENT") {
      await this.ensureStudentCanAccess(session.classroomId, userId);
    }

    const players = await this.repository.leaderboard(id);
    return players.map((player, index) => ({
      studentId: player.studentId,
      name: player.student.name,
      avatarUrl: player.student.avatarUrl,
      score: player.score,
      rank: player.rank ?? index + 1,
    }));
  }

  private async ensureSessionExists(id: string) {
    const session = await this.repository.findById(id);
    if (!session) {
      throw new AppError(
        404,
        ErrorCode.LIVE_SESSION_NOT_FOUND,
        "Live session not found",
      );
    }
    return session;
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

  private async ensureStudentCanAccess(classroomId: string, studentId: string) {
    const membership = await this.repository.findMembership(classroomId, studentId);
    if (!membership) {
      throw new AppError(
        403,
        ErrorCode.FORBIDDEN,
        "You are not enrolled in this classroom",
      );
    }
  }

  private createPin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
