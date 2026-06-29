import { useMemo } from "react";
import { WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Card, Badge } from "@/shared/components";
import { useAnalytics } from "../../hooks/useAnalytics";
import { ChartCard } from "@/shared/components/dashboard";

interface AnalyticsTabProps {
  classroomId: string;
}

export function AnalyticsTab({ classroomId }: AnalyticsTabProps) {
  const { analytics, isLoading } = useAnalytics(classroomId);

  const chartDataPoints = useMemo(() => {
    return analytics.chartDataPoints.map((p) => ({
      date: p.name.split(" ")[0] ?? "Student",
      value: p.value,
    }));
  }, [analytics.chartDataPoints]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-card rounded-lg" />
        <div className="h-44 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Overview charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Class Accuracy Analytics"
            description="Average correctness scores across active students in this classroom"
            type="accuracy"
            dataPoints={chartDataPoints}
          />
        </div>

        {/* Completion Range details */}
        <Card className="p-5 border border-border/80 flex flex-col justify-between">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-3">Performance Split</h3>
          <div className="space-y-3.5 my-auto">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                Exceeding 90%
              </span>
              <span className="font-bold text-foreground">{analytics.completionRanges.above90} students</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ClockIcon size={14} className="text-orange-500" />
                Steady 70% - 90%
              </span>
              <span className="font-bold text-foreground">{analytics.completionRanges.between70And90} students</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <WarningCircle size={14} className="text-rose-500" />
                Under 70%
              </span>
              <span className="font-bold text-foreground">{analytics.completionRanges.below70} students</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal mt-4 pt-3 border-t border-border/40">
            Use these groups to assign targeted vocabulary practice card decks.
          </p>
        </Card>
      </div>

      {/* Leaderboard and Weak vocab list split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="px-1 text-xs font-black text-muted-foreground uppercase tracking-wide">Class Standings</h3>
          <Card padding="none" className="overflow-hidden border border-border/80">
            {analytics.rankings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-sidebar-accent text-[10px] font-black text-muted-foreground uppercase">
                      <th className="px-5 py-2.5">Rank</th>
                      <th className="px-5 py-2.5">Name</th>
                      <th className="px-5 py-2.5 text-right">Avg Accuracy</th>
                      <th className="px-5 py-2.5 text-right">XP Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {analytics.rankings.map((student, idx) => (
                      <tr key={student.studentId} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-5 py-3 font-bold text-primary">#{idx + 1}</td>
                        <td className="px-5 py-3 font-semibold text-foreground">{student.name}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600">
                          {student.averageAccuracy}%
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                          {student.score} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 text-center text-xs text-muted-foreground">
                No standings records.
              </div>
            )}
          </Card>
        </div>

        {/* Weak Words */}
        <div className="space-y-3">
          <h3 className="px-1 text-xs font-black text-muted-foreground uppercase tracking-wide">Weak Words (Needs Work)</h3>
          <Card className="p-5 border border-border/80 space-y-3 min-h-[200px]">
            {analytics.weakVocabulary.length > 0 ? (
              <div className="space-y-2.5">
                {analytics.weakVocabulary.map((item) => (
                  <div
                    key={item.vocabItemId}
                    className="flex justify-between items-center p-2.5 border border-border/80 rounded-xl hover:bg-rose-500/5 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{(item as any).vocabItem?.term ?? item.term}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Attempts: {item.attempts}
                      </p>
                    </div>
                    <Badge variant="warning" className="text-[9px] py-0 uppercase">
                      {item.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
                <CheckCircle size={28} className="text-emerald-500 mb-1.5" />
                <p className="font-bold text-foreground">All vocabulary mastered!</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Students have mastered all vocabulary decks.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder icon wrapper for Clock
function ClockIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      style={{ width: size, height: size }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
