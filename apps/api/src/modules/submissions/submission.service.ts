import { AppError, ErrorCode } from "../../shared/errors/app.error";
import {
  MasteryUpdateInput,
  SubmissionRepository,
} from "./submission.repository";
import { SubmitAssignmentInput } from "./submission.schema";

type AnswerRecord = Record<string, unknown>;

export class SubmissionService {
  constructor(private readonly repository: SubmissionRepository) {}

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    data: SubmitAssignmentInput,
  ) {
    const assignment = await this.repository.findAssignmentForStudent(
      assignmentId,
      studentId,
    );

    if (!assignment) {
      throw new AppError(
        404,
        ErrorCode.ASSIGNMENT_NOT_FOUND,
        "Assignment not found",
      );
    }

    const masteryUpdates = this.resolveMasteryUpdates(
      data.answers,
      assignment.vocabSet.vocabItems.map((item) => item.id),
      data.accuracy,
    );

    return this.repository.submitAssignment(
      assignment,
      studentId,
      data,
      masteryUpdates,
    );
  }

  private resolveMasteryUpdates(
    answers: unknown,
    vocabItemIds: string[],
    accuracy: number,
  ): MasteryUpdateInput[] {
    const explicit = this.extractExplicitMastery(answers, vocabItemIds);
    if (explicit.length > 0) return explicit;

    const fallbackStatus = accuracy >= 80 ? "KNOWN" : "LEARNING";
    return vocabItemIds.map((vocabItemId) => ({
      vocabItemId,
      status: fallbackStatus,
    }));
  }

  private extractExplicitMastery(
    answers: unknown,
    vocabItemIds: string[],
  ): MasteryUpdateInput[] {
    if (!answers || typeof answers !== "object") return [];

    const vocabItemIdSet = new Set(vocabItemIds);
    const answerObject = answers as AnswerRecord;
    const candidates = [
      answerObject.mastery,
      answerObject.cardResults,
      answerObject.items,
      Array.isArray(answers) ? answers : undefined,
    ].find((value) => Array.isArray(value)) as AnswerRecord[] | undefined;

    if (!candidates) return [];

    const updates = new Map<string, MasteryUpdateInput>();

    for (const entry of candidates) {
      const vocabItemId = String(
        entry.vocabItemId ?? entry.itemId ?? entry.id ?? "",
      );
      if (!vocabItemIdSet.has(vocabItemId)) continue;

      const rawStatus = String(entry.status ?? "").toUpperCase();
      let status: MasteryUpdateInput["status"] | null = null;

      if (
        rawStatus === "KNOWN" ||
        entry.known === true ||
        entry.correct === true
      ) {
        status = "KNOWN";
      } else if (
        rawStatus === "LEARNING" ||
        rawStatus === "STILL_LEARNING" ||
        entry.known === false ||
        entry.correct === false
      ) {
        status = "LEARNING";
      } else if (rawStatus === "NEW") {
        status = "NEW";
      }

      if (status) {
        updates.set(vocabItemId, { vocabItemId, status });
      }
    }

    return [...updates.values()];
  }
}
