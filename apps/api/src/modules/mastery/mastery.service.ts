import { MasteryRepository } from "./mastery.repository";
import { AppError, ErrorCode } from "../../shared/errors/app.error";

export class MasteryService {
  constructor(private readonly repository: MasteryRepository) {}

  async getMastery(studentId: string, vocabSetId?: string) {
    const items = await this.repository.findItemsForStudent(studentId, vocabSetId);
    const counts = {
      known: 0,
      learning: 0,
      new: 0,
      total: items.length,
    };

    const rows = items.map((item) => {
      const mastery = item.masteries[0];
      const status = mastery?.status ?? "NEW";

      if (status === "KNOWN") counts.known += 1;
      else if (status === "LEARNING") counts.learning += 1;
      else counts.new += 1;

      return {
        vocabItemId: item.id,
        term: item.term,
        vocabSet: item.vocabSet,
        status,
        attempts: mastery?.attempts ?? 0,
        lastSeenAt: mastery?.lastSeenAt ?? null,
      };
    });

    const percent = (value: number) =>
      counts.total > 0 ? Math.round((value / counts.total) * 100) : 0;

    return {
      known: counts.known,
      learning: counts.learning,
      new: counts.new,
      total: counts.total,
      percentages: {
        known: percent(counts.known),
        learning: percent(counts.learning),
        new: percent(counts.new),
      },
      items: rows,
    };
  }

  async getClassroomMastery(classroomId: string, teacherId: string) {
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

    const rows = await this.repository.findMasteriesForClassroom(classroomId);
    const counts = {
      known: rows.filter((row) => row.status === "KNOWN").length,
      learning: rows.filter((row) => row.status === "LEARNING").length,
      new: rows.filter((row) => row.status === "NEW").length,
      total: rows.length,
    };
    const percent = (value: number) =>
      counts.total > 0 ? Math.round((value / counts.total) * 100) : 0;

    return {
      ...counts,
      percentages: {
        known: percent(counts.known),
        learning: percent(counts.learning),
        new: percent(counts.new),
      },
      items: rows,
    };
  }
}
