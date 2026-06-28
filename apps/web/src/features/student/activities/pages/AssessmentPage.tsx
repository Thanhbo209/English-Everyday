import type { FC } from "react";
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { generateQuestions } from "../utils/generateQuestions";
import { AssessmentShell } from "../components/AssessmentShell";
import { SessionSummary } from "../components/SessionSummary";
import { EmptyAssessment } from "../components/EmptyAssessment";
import { LoadingQuestion } from "../components/LoadingQuestion";
import { useSubmission } from "../hooks/useSubmission";
import type { AssessmentStats } from "../types";

export const AssessmentPage: FC = () => {
  const { activityType, assignmentId } = useParams<{
    activityType: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  const [retryCount, setRetryCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<AssessmentStats | null>(
    null,
  );

  // Fetch the assignment details and its vocabulary items
  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(
    assignmentId,
    undefined,
  );

  // Submission mutation
  const submission = useSubmission(assignmentId);

  // Generate randomized questions on load and reset
  const questions = useMemo(() => {
    if (!vocabItems || vocabItems.length === 0 || !activityType) return [];
    return generateQuestions(vocabItems, activityType);
  }, [vocabItems, activityType, retryCount]);

  const activityName = useMemo(() => {
    const type = activityType?.toUpperCase() || "";
    switch (type) {
      case "Q1":
        return "Q1 • Pick Image (Word prompt)";
      case "Q2":
        return "Q2 • Pick Word (Image prompt)";
      case "Q3":
        return "Q3 • Pick Meaning (Word prompt)";
      case "Q4":
        return "Q4 • Pick Word (Meaning prompt)";
      case "Q5":
        return "Q5 • Pick Word (Audio prompt)";
      case "Q6":
        return "Q6 • Pick Image (Audio prompt)";
      case "Q7":
        return "Q7 • Pick Meaning (Audio prompt)";
      case "F1":
        return "F1 • Type Word (Image prompt)";
      case "F2":
        return "F2 • Type Word (Meaning prompt)";
      case "F3":
        return "F3 • Type Word (Audio prompt)";
      case "F4":
        return "F4 • Type Word (Image + Scrambled letters)";
      case "F5":
        return "F5 • Type Word (Meaning + Scrambled letters)";
      case "F6":
        return "F6 • Type Word (Audio + Scrambled letters)";
      default:
        return `${type} • Assessment Activity`;
    }
  }, [activityType]);

  const handleAssessmentComplete = async (stats: AssessmentStats) => {
    setSessionStats(stats);

    if (assignmentId) {
      try {
        await submission.mutateAsync({
          score: stats.score,
          accuracy: stats.accuracy,
          timeTakenSec: stats.timeTakenSec,
          answers: {
            activityType: activityType?.toUpperCase() || "",
            total: stats.total,
            correct: stats.correct,
            wrong: stats.wrong,
            answersMeta: stats,
          },
        });
      } catch {
        return;
      }
    }
    setShowSummary(true);
  };

  const handleRetry = () => {
    setShowSummary(false);
    setSessionStats(null);
    setRetryCount((prev) => prev + 1);
  };

  if (isLoading) {
    return <LoadingQuestion />;
  }

  if (vocabItems.length === 0) {
    return (
      <EmptyAssessment
        vocabSetTitle={vocabSet?.title}
        onBackClick={() => navigate(-1)}
      />
    );
  }

  if (showSummary && sessionStats) {
    return (
      <SessionSummary
        total={sessionStats.total}
        correct={sessionStats.correct}
        wrong={sessionStats.wrong}
        accuracy={sessionStats.accuracy}
        score={sessionStats.score}
        timeTakenSec={sessionStats.timeTakenSec}
        onRetry={handleRetry}
        onExit={() => navigate("/dashboard")}
        isSubmitting={submission.isPending}
      />
    );
  }

  return (
    <AssessmentShell
      questions={questions}
      vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
      activityName={activityName}
      onComplete={handleAssessmentComplete}
      isSubmitting={submission.isPending}
    />
  );
};

export default AssessmentPage;
