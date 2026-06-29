import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Users,
  BookOpen,
  ChartLineUp,
  Plus,
  ClipboardText,
  FileCsv,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { Button, Badge, Card } from "@/shared/components";
import { ClassroomModal } from "@/features/teacher/classrooms/components/ClassroomModal";
import { useClassrooms } from "@/features/classrooms";
import { useAssignments } from "@/features/teacher/assignments";
import { useDashboardSummary } from "@/shared/hooks/useDashboardSummary";
import { useRecentActivities } from "@/shared/hooks/useRecentActivities";
import { useLeaderboard } from "@/shared/hooks/useLeaderboard";
import { useMasterySummary } from "@/shared/hooks/useMasterySummary";
import { exportProgressToCSV } from "../utils/export";
import {
  StatCard,
  RecentActivityCard,
  HeatmapCard,
  SectionHeader,
  DashboardGrid,
  SkeletonCard,
} from "@/shared/components/dashboard";
import { Input } from "@/shared/components/Input";

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const { data: assignments, isLoading: loadingAssignments } = useAssignments();

  const primaryClassroomId = classrooms?.[0]?.id;

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary(primaryClassroomId);
  const { data: recentActivities, isLoading: loadingActivities } = useRecentActivities();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(primaryClassroomId);
  const { data: mastery, isLoading: loadingMastery } = useMasterySummary(undefined, primaryClassroomId);

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "accuracy">("name");

  const isLoading =
    loadingClassrooms ||
    loadingAssignments ||
    loadingSummary ||
    loadingActivities ||
    loadingLeaderboard ||
    loadingMastery;

  // Filter & sort leaderboard students for the Student Progress table
  const filteredStudents = useMemo(() => {
    if (!leaderboard) return [];
    let items = [...leaderboard];

    if (searchTerm) {
      items = items.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    items.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "score") return b.score - a.score;
      return b.averageAccuracy - a.averageAccuracy;
    });

    return items;
  }, [leaderboard, searchTerm, sortBy]);

  // Transform mastery items for Heatmap
  const heatmapItems = useMemo(() => {
    if (!mastery?.items) return [];
    return mastery.items.map((item) => ({
      id: item.vocabItemId,
      term: (item as any).vocabItem?.term ?? item.term ?? "",
      status: item.status,
      attempts: item.attempts,
    }));
  }, [mastery]);

  const handleExportCSV = () => {
    if (!leaderboard) return;
    const exportData = leaderboard.map((s) => ({
      name: s.name,
      rank: s.rank,
      score: s.score,
      attempts: s.attempts,
      accuracy: s.averageAccuracy,
    }));
    exportProgressToCSV(
      exportData,
      ["name", "rank", "score", "attempts", "accuracy"],
      "classroom_student_progress.csv"
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="h-16 bg-muted rounded-xl w-1/3" />
        <DashboardGrid cols={4}>
          <SkeletonCard type="stat" />
          <SkeletonCard type="stat" />
          <SkeletonCard type="stat" />
          <SkeletonCard type="stat" />
        </DashboardGrid>
        <DashboardGrid cols={3}>
          <div className="lg:col-span-2">
            <SkeletonCard type="chart" />
          </div>
          <SkeletonCard type="list" />
        </DashboardGrid>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header section */}
      <SectionHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "Teacher"}`}
        description="Track assignments, mastery, and student performance from live learning data."
        category="Teacher workspace"
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Dashboard" }]}
        action={
          <div className="flex gap-2">
            <Button
              leftIcon={<Plus size={16} />}
              size="sm"
              onClick={() => setModalOpen(true)}
              className="cursor-pointer"
            >
              New Classroom
            </Button>
          </div>
        }
      />

      {/* Section 1: Overview stats cards */}
      <DashboardGrid cols={4}>
        <StatCard
          label="Total Classrooms"
          value={summary?.totalClassrooms ?? 0}
          icon={<ChalkboardTeacher size={24} />}
          iconTone="yellow"
        />
        <StatCard
          label="Total Students"
          value={summary?.totalStudents ?? 0}
          icon={<Users size={24} />}
          iconTone="blue"
        />
        <StatCard
          label="Completion Rate"
          value={`${summary?.completionRate ?? 0}%`}
          icon={<BookOpen size={24} />}
          iconTone="green"
        />
        <StatCard
          label="Average Accuracy"
          value={`${summary?.averageAccuracy ?? 0}%`}
          icon={<ChartLineUp size={24} />}
          iconTone="orange"
        />
      </DashboardGrid>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 3: Assignments table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Assignments Overview</h3>
            <button
              onClick={() => navigate("/dashboard/assignments")}
              className="text-xs text-primary hover:underline font-bold cursor-pointer"
            >
              Manage
            </button>
          </div>

          <Card padding="none" className="overflow-hidden border border-border">
            {assignments?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/10 text-xs font-bold text-muted-foreground uppercase">
                      <th className="p-4">Assignment</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Submissions</th>
                      <th className="p-4">Classroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {assignments.slice(0, 5).map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <ClipboardText size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground leading-tight">
                                {assignment.title}
                              </p>
                              <Badge variant="info" className="mt-1">
                                {assignment.activityType}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-semibold text-muted-foreground">
                          {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : "No due date"}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-foreground">
                            {assignment._count?.submissions ?? 0}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-bold text-muted-foreground">
                          {assignment.classroom?.name ?? "Default Classroom"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No assignments created yet.
              </div>
            )}
          </Card>
        </div>

        {/* Section 2: Recent Activity Timeline */}
        <RecentActivityCard activities={recentActivities ?? []} />
      </div>

      {/* Section 4: Student Progress Table & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-foreground">Student Progress</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 text-xs py-1"
              />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="name">Name</option>
                <option value="score">XP Score</option>
                <option value="accuracy">Accuracy</option>
              </select>
              <Button
                leftIcon={<FileCsv size={16} />}
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="cursor-pointer"
              >
                Export
              </Button>
            </div>
          </div>

          <Card padding="none" className="overflow-hidden border border-border">
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/10 text-xs font-bold text-muted-foreground uppercase">
                      <th className="p-4">Rank</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Attempts</th>
                      <th className="p-4">Avg Accuracy</th>
                      <th className="p-4">XP Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-4 font-bold text-primary">#{student.rank}</td>
                        <td className="p-4 font-semibold text-foreground">{student.name}</td>
                        <td className="p-4">{student.attempts}</td>
                        <td className="p-4 font-semibold text-emerald-600">
                          {student.averageAccuracy}%
                        </td>
                        <td className="p-4 font-mono font-bold text-foreground">
                          {student.score} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No students match filter criteria.
              </div>
            )}
          </Card>
        </div>

        {/* Section 5: Mastery Heatmap */}
        <HeatmapCard
          title="Vocabulary Mastery"
          items={heatmapItems}
        />
      </div>

      <ClassroomModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
