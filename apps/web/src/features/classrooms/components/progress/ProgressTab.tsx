import { useMemo } from "react";
import { Star, Fire, CheckCircle } from "@phosphor-icons/react";
import { Card } from "@/shared/components";
import { useProgress, useMastery } from "@/features/student/activities/flashcard";
import { ChartCard } from "@/shared/components/dashboard";
import { useAuth } from "@/features/auth";
import { useVocabSets } from "@/features/teacher/vocab-builder";

interface ProgressTabProps {
  classroomId: string;
}

export function ProgressTab({ classroomId }: ProgressTabProps) {
  const { user } = useAuth();
  const { data: progress, isLoading: loadingProgress } = useProgress();
  const { data: mastery, isLoading: loadingMastery } = useMastery();
  const { data: vocabSets } = useVocabSets(classroomId);

  const chartDataPoints = useMemo(() => {
    if (!progress?.history) return [];
    
    // Filter history records matching this classroom's vocab set IDs
    const classVocabSetIds = new Set(vocabSets?.map((s) => s.id) || []);
    const classHistory = progress.history.filter(
      (h) => h.vocabSet && classVocabSetIds.has(h.vocabSet.id)
    );

    return classHistory.slice(0, 10).map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      value: record.score,
    })).reverse();
  }, [progress, classroomId, vocabSets]);

  if (loadingProgress || loadingMastery) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-card rounded-lg" />
        <div className="h-44 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Overview statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
            <Star size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Total XP</p>
            <p className="text-base font-extrabold text-foreground mt-0.5 leading-none">
              {(user?.xp ?? 0).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Fire size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Streak</p>
            <p className="text-base font-extrabold text-foreground mt-0.5 leading-none">3 Days</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Best Score</p>
            <p className="text-base font-extrabold text-foreground mt-0.5 leading-none">
              {progress?.bestScore ?? 0}
            </p>
          </div>
        </Card>
      </div>

      {/* SVG Accuracy & Progress chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Classroom Learning History"
            description="Milestone score records earned across assignments in this classroom"
            type="score"
            dataPoints={chartDataPoints}
          />
        </div>

        {/* Vocab mastery summary */}
        <Card className="p-5 border border-border/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3.5">
              Vocab Mastery
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Known words (Mastered)</span>
                <span className="font-bold text-emerald-600">{mastery?.known ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Learning (In Progress)</span>
                <span className="font-bold text-orange-500">{mastery?.learning ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New terms (Assigned)</span>
                <span className="font-bold text-muted-foreground">{mastery?.new ?? 0}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal mt-4 pt-3 border-t border-border/40">
            Review decks under the Vocabulary tab to turn learning terms into mastered words.
          </p>
        </Card>
      </div>
    </div>
  );
}
