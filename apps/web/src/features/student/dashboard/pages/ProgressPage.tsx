import { ChartLineUp, Trophy, CheckCircle, Brain } from "@phosphor-icons/react";
import { Card, LoadingSpinner } from "@/shared/components";
import { useProgress } from "@/features/student/activities/flashcard";
import { useMastery } from "@/features/student/activities/flashcard";

export default function ProgressPage() {
  const { data: progress, isLoading: loadingProgress } = useProgress();
  const { data: mastery, isLoading: loadingMastery } = useMastery();

  if (loadingProgress || loadingMastery) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Learning history</p>
        <h2 className="text-2xl font-bold text-foreground">Progress</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <ChartLineUp size={24} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-xl font-bold">{progress?.accuracy ?? 0}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Trophy size={24} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Best Score</p>
            <p className="text-xl font-bold">{progress?.bestScore ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <CheckCircle size={24} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-xl font-bold">{progress?.activitiesCompleted ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Brain size={24} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Known Words</p>
            <p className="text-xl font-bold">{mastery?.known ?? 0}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="space-y-4">
          <h3 className="text-base font-semibold">Vocabulary Mastery</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-secondary">{mastery?.known ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Known</p>
            </div>
            <div>
              <p className="text-xl font-bold text-accent-foreground">{mastery?.learning ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Learning</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{mastery?.new ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">New</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary"
              style={{ width: `${mastery?.percentages.known ?? 0}%` }}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2" padding="none">
          {progress?.history.length ? (
            <ul className="divide-y divide-border">
              {progress.history.map((record) => (
                <li key={record.id} className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">
                    {record.activityType} · {record.vocabSet?.title ?? "Vocabulary"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score {record.score} · {record.accuracy}% accuracy · {new Date(record.recordedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-sm text-muted-foreground text-center">
              Complete an assignment to start building your progress history.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
