import { ProgressRepository } from "./progress.repository";

export class ProgressService {
  constructor(private readonly repository: ProgressRepository) {}

  async getProgress(studentId: string, vocabSetId?: string) {
    const history = await this.repository.findByStudent(studentId, vocabSetId);
    const activitiesCompleted = history.length;
    const bestScore = history.reduce(
      (best, record) => Math.max(best, record.score),
      0,
    );
    const accuracy =
      activitiesCompleted > 0
        ? Math.round(
            history.reduce((sum, record) => sum + record.accuracy, 0) /
              activitiesCompleted,
          )
        : 0;

    return {
      history,
      accuracy,
      bestScore,
      activitiesCompleted,
    };
  }
}
