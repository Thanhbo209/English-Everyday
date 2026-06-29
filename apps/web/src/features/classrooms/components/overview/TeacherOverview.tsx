import {
  ClipboardText,
  Plus,
  Books,
  Users,
  CheckCircle,
  ChartLineUp,
} from "@phosphor-icons/react";
import { Button, Card } from "@/shared/components";
import { useClassStats } from "../../hooks/useClassStats";
import { useActivityFeed } from "../../hooks/useActivityFeed";
import { ActivityFeed } from "../ActivityFeed";

interface TeacherOverviewProps {
  classroomId: string;
  onTabChange: (tabId: string) => void;
  onCreateAssignment?: () => void;
}

export function TeacherOverview({
  classroomId,
  onTabChange,
  onCreateAssignment,
}: TeacherOverviewProps) {
  const { stats, isLoading: loadingStats } = useClassStats(classroomId);
  const { activities, isLoading: loadingActivity } = useActivityFeed(classroomId);

  return (
    <div className="space-y-6 select-none">
      {/* Quick stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Students</p>
            <p className="text-lg font-black text-foreground mt-1 leading-none">
              {loadingStats ? "..." : stats.studentCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <ClipboardText size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Tasks Due</p>
            <p className="text-lg font-black text-foreground mt-1 leading-none">
              {loadingStats ? "..." : stats.assignmentCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Completion</p>
            <p className="text-lg font-black text-foreground mt-1 leading-none">
              {loadingStats ? "..." : `${stats.completionRate}%`}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border/80">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <ChartLineUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Avg Accuracy</p>
            <p className="text-lg font-black text-foreground mt-1 leading-none">
              {loadingStats ? "..." : `${stats.averageAccuracy}%`}
            </p>
          </div>
        </Card>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Feed & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border border-border/80 space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <h3 className="text-sm font-bold text-foreground">Recent Classroom Events</h3>
              <button
                onClick={() => onTabChange("analytics")}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                Full Analytics
              </button>
            </div>
            <ActivityFeed activities={activities} isLoading={loadingActivity} />
          </Card>
        </div>

        {/* Right column: Quick controls list */}
        <div className="space-y-6">
          <Card className="p-5 border border-border/80 space-y-4 bg-gradient-to-br from-card to-secondary/10">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide">Quick Controls</h3>
            <div className="space-y-3">
              <Button
                onClick={onCreateAssignment}
                className="w-full text-left justify-start cursor-pointer h-10 text-xs gap-2.5 font-bold"
                leftIcon={<Plus size={16} />}
              >
                Create Assignment
              </Button>
              <Button
                variant="outline"
                onClick={() => onTabChange("vocabulary")}
                className="w-full text-left justify-start cursor-pointer h-10 text-xs gap-2.5 font-bold"
                leftIcon={<Books size={16} />}
              >
                Assign Vocab Decks
              </Button>
              <Button
                variant="outline"
                onClick={() => onTabChange("members")}
                className="w-full text-left justify-start cursor-pointer h-10 text-xs gap-2.5 font-bold"
                leftIcon={<Users size={16} />}
              >
                Invite Students
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
