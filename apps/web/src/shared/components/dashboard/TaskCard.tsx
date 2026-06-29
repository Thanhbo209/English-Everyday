import type { FC } from "react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { ArrowRight, ClipboardText } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/utils";

interface TaskCardProps {
  id: string;
  title: string;
  activityType: string;
  vocabSetTitle: string;
  wordsCount: number;
  dueAt: string | null;
  status?: "PENDING" | "COMPLETED";
  difficulty?: string;
  onAction: () => void;
}

export const TaskCard: FC<TaskCardProps> = ({
  title,
  activityType,
  vocabSetTitle,
  wordsCount,
  dueAt,
  status = "PENDING",
  difficulty,
  onAction,
}) => {
  const isCompleted = status === "COMPLETED";

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return "info";
    if (diff.toUpperCase() === "EASY") return "success";
    if (diff.toUpperCase() === "MEDIUM") return "warning";
    return "destructive";
  };

  return (
    <Card className="p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <ClipboardText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-sm font-semibold text-foreground truncate">{title}</h5>
            <Badge variant="info">{activityType}</Badge>
            {difficulty && (
              <Badge variant={getDifficultyColor(difficulty)}>{difficulty}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {vocabSetTitle} · {wordsCount} words
          </p>
          {dueAt && (
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              Due: {new Date(dueAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-border pt-3 md:pt-0 shrink-0">
        <span className={cn("text-xs font-bold", isCompleted ? "text-emerald-500" : "text-amber-500")}>
          {isCompleted ? "Completed" : "Pending"}
        </span>

        {!isCompleted && (
          <Button
            size="sm"
            onClick={onAction}
            className="cursor-pointer gap-1.5"
          >
            <span>Start</span>
            <ArrowRight size={14} />
          </Button>
        )}
      </div>
    </Card>
  );
};
