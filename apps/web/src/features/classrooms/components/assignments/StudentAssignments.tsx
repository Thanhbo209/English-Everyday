import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardText, CheckCircle, Warning, Clock, Calendar } from "@phosphor-icons/react";
import { Button, Card, Badge, EmptyState } from "@/shared/components";
import { useStudentAssignments } from "@/features/student/activities/flashcard";

interface StudentAssignmentsProps {
  classroomId: string;
}

export function StudentAssignments({ classroomId }: StudentAssignmentsProps) {
  const navigate = useNavigate();
  const { data: assignments, isLoading } = useStudentAssignments();

  const groupedTasks = useMemo(() => {
    if (!assignments) return { dueToday: [], upcoming: [], overdue: [], completed: [] };
    
    const classroomTasks = assignments.filter((a) => a.classroomId === classroomId);

    const now = Date.now();
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    const dueToday: any[] = [];
    const upcoming: any[] = [];
    const overdue: any[] = [];
    const completed: any[] = [];

    classroomTasks.forEach((task) => {
      // Check if task is completed
      if (task.submissions?.length) {
        completed.push(task);
        return;
      }

      if (!task.dueAt) {
        upcoming.push(task);
        return;
      }

      const dueTime = new Date(task.dueAt).getTime();
      if (dueTime < now) {
        overdue.push(task);
      } else if (dueTime <= todayEnd) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { dueToday, upcoming, overdue, completed };
  }, [assignments, classroomId]);

  const hasTasks =
    groupedTasks.dueToday.length > 0 ||
    groupedTasks.upcoming.length > 0 ||
    groupedTasks.overdue.length > 0 ||
    groupedTasks.completed.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-card rounded-lg" />
        <div className="h-20 bg-card rounded-lg" />
      </div>
    );
  }

  if (!hasTasks) {
    return (
      <EmptyState
        icon={<ClipboardText size={28} />}
        title="No assignments in class"
        description="All caught up! Your teacher hasn't assigned any activities yet."
      />
    );
  }

  const renderTaskSection = (title: string, list: any[], icon: any, colorClass: string) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs font-black text-muted-foreground uppercase tracking-wider">
          <span className={colorClass}>{icon}</span>
          {title} ({list.length})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((task) => {
            const isCompleted = task.submissions?.length > 0;
            return (
              <Card
                key={task.id}
                className="p-4 flex flex-col justify-between border border-border/80 min-h-[130px] hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-black text-foreground leading-snug">{task.title}</h4>
                    <Badge variant={isCompleted ? "success" : "info"} className="text-[9px] uppercase font-bold py-0.5 shrink-0">
                      {task.activityType}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Deck: {task.vocabSet?.title ?? "Vocabulary"}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-3">
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {task.dueAt
                      ? `Due: ${new Date(task.dueAt).toLocaleDateString()}`
                      : "No deadline"}
                  </span>

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/student/activities/${task.activityType.toLowerCase()}/assignments/${task.id}`
                      )
                    }
                    className="cursor-pointer h-7 text-[10px] font-bold px-3"
                  >
                    {isCompleted ? "Practice Again" : "Start Now"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7 select-none">
      {renderTaskSection("Due Today", groupedTasks.dueToday, <Clock size={14} />, "text-orange-500")}
      {renderTaskSection("Overdue Tasks", groupedTasks.overdue, <Warning size={14} />, "text-rose-500")}
      {renderTaskSection("Upcoming Assignments", groupedTasks.upcoming, <Calendar size={14} />, "text-blue-500")}
      {renderTaskSection("Completed Tasks", groupedTasks.completed, <CheckCircle size={14} />, "text-emerald-500")}
    </div>
  );
}
