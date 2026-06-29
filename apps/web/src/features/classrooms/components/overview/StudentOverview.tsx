import { useNavigate } from "react-router-dom";
import {
  Fire,
  Sparkle,
  Star,
  CheckCircle,
  Trophy,
} from "@phosphor-icons/react";
import { Button, Card, Badge } from "@/shared/components";
import { useClassStats } from "../../hooks/useClassStats";
import { useMemo } from "react";
import { useStudentAssignments } from "@/features/student/activities/flashcard";
import { useLeaderboard } from "@/shared/hooks/useLeaderboard";

interface StudentOverviewProps {
  classroomId: string;
  onTabChange: (tabId: string) => void;
}

export function StudentOverview({ classroomId, onTabChange }: StudentOverviewProps) {
  const navigate = useNavigate();
  const { stats, isLoading: _loadingStats } = useClassStats(classroomId);
  const { data: assignments } = useStudentAssignments();
  const { data: leaderboard } = useLeaderboard(classroomId);

  // Filter tasks due for this classroom
  const pendingTasks = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter(
      (a) => a.classroomId === classroomId && !a.submissions?.length
    );
  }, [assignments, classroomId]);

  const streak = 3;
  const xpGoal = 100;
  const goalPercent = Math.min(Math.round((stats.totalXP / xpGoal) * 100), 100);

  return (
    <div className="space-y-6 select-none">
      {/* Motivational header */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-5 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/10 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 animate-bounce">
          <Sparkle size={24} weight="fill" />
        </div>
        <div className="flex-1 space-y-1.5 text-center md:text-left">
          <h4 className="text-base font-extrabold text-foreground leading-tight">Master English daily!</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
            Complete tasks assigned by your teacher, review vocabulary card decks, and climb your classroom standings.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 bg-card px-4 py-3 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <Fire size={20} className="text-orange-500 fill-orange-500" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Streak</p>
              <p className="text-sm font-extrabold text-foreground mt-0.5 leading-none">{streak} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">XP Goal</p>
              <p className="text-sm font-extrabold text-foreground mt-0.5 leading-none">{goalPercent}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending tasks & Next steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border border-border/80 space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <h3 className="text-sm font-bold text-foreground">Pending Assignments</h3>
              <button
                onClick={() => onTabChange("assignments")}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                View All
              </button>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-3.5 border border-border/85 rounded-xl hover:bg-secondary/15 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info" className="text-[9px] py-0">
                          {task.activityType}
                        </Badge>
                        {task.dueAt && (
                          <span className="text-[9px] text-muted-foreground">
                            Due: {new Date(task.dueAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/student/activities/${task.activityType.toLowerCase()}/assignments/${task.id}`
                        )
                      }
                      className="cursor-pointer h-7 text-[10px] font-bold"
                    >
                      Start Task
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle size={28} className="text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-foreground">You are all caught up!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Great work. Practice vocabulary sets directly to keep sharp.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Standing preview & Statistics details */}
        <div className="space-y-6">
          <Card className="p-5 border border-border/80 space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide">Classroom Rank</h3>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((student, idx) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary w-4">#{idx + 1}</span>
                      <span className="font-semibold text-foreground truncate max-w-[100px]">{student.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground font-bold">{student.score} XP</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No standings records.
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange("members")}
              className="w-full cursor-pointer h-8 text-[10px] font-bold"
              leftIcon={<Trophy size={14} />}
            >
              Full Leaderboard
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
