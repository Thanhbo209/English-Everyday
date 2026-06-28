import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Users,
  BookOpen,
  ChartLineUp,
  Plus,
  Trophy,
  ClipboardText,
  Broadcast,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { DashboardStatCard, Badge, Button, Card, LoadingSpinner } from "@/shared/components";
import { useClassrooms } from "@/features/teacher/classrooms";
import { ClassroomModal } from "../../features/classroom/components/ClassroomModal";
import { useAssignments } from "@/features/teacher/assignments";
import { useLeaderboard } from "@/features/student/activities/flashcard";
import { useClassroomMastery } from "@/features/student/activities/flashcard";
import { useLiveSessions } from "@/features/student/activities/flashcard";

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const { data: assignments, isLoading: loadingAssignments } = useAssignments();
  const primaryClassroomId = classrooms?.[0]?.id;
  const { data: leaderboard } = useLeaderboard(primaryClassroomId);
  const { data: mastery } = useClassroomMastery(primaryClassroomId);
  const { data: liveSessions } = useLiveSessions();
  const [modalOpen, setModalOpen] = useState(false);

  if (loadingClassrooms || loadingAssignments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const totalClassrooms = classrooms?.length ?? 0;
  const totalStudents =
    classrooms?.reduce((acc, classroom) => acc + (classroom._count?.classroomsMembers ?? 0), 0) ?? 0;
  const totalAssignments = assignments?.length ?? 0;
  const totalSubmissions =
    assignments?.reduce((acc, assignment) => acc + (assignment._count?.submissions ?? 0), 0) ?? 0;
  const completionRate =
    totalAssignments > 0 && totalStudents > 0
      ? Math.round((totalSubmissions / (totalAssignments * totalStudents)) * 100)
      : 0;
  const averageAccuracy =
    leaderboard && leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce((sum, entry) => sum + entry.averageAccuracy, 0) /
            leaderboard.length,
        )
      : 0;
  const activeLiveSessions = liveSessions?.filter((session) => session.status !== "ENDED") ?? [];

  const STATS = [
    {
      label: "Classrooms",
      value: totalClassrooms,
      icon: <ChalkboardTeacher size={22} />,
      iconTone: "yellow" as const,
    },
    {
      label: "Students",
      value: totalStudents,
      icon: <Users size={22} />,
      iconTone: "blue" as const,
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      icon: <BookOpen size={22} />,
      iconTone: "green" as const,
    },
    {
      label: "Avg Accuracy",
      value: `${averageAccuracy}%`,
      icon: <ChartLineUp size={22} />,
      iconTone: "orange" as const,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Teacher workspace</p>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {user?.name?.split(" ")[0] ?? "Teacher"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track assignments, mastery, and student performance from live learning data.
            </p>
          </div>
          <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => setModalOpen(true)}>
            New Classroom
          </Button>
        </div>

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Assignment Completion</h3>
            <button
              onClick={() => navigate("/dashboard/assignments")}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {assignments?.length ? (
              assignments.slice(0, 5).map((assignment) => (
                <Card key={assignment.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ClipboardText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {assignment.title}
                      </p>
                      <Badge variant="info">{assignment.activityType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.classroom?.name ?? "Classroom"} · {assignment._count?.submissions ?? 0} submissions
                    </p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardText size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground">No assignments yet</p>
                <Button
                  size="sm"
                  className="mt-3"
                  leftIcon={<Plus size={14} />}
                  onClick={() => navigate("/dashboard/assignments")}
                >
                  Create Assignment
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Mastery Distribution</h3>
          <Card className="space-y-4">
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
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-secondary"
                style={{ width: `${mastery?.percentages.known ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {mastery?.percentages.known ?? 0}% known in {classrooms?.[0]?.name ?? "selected classroom"}.
            </p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Leaderboard</h3>
          <Card padding="none">
            {leaderboard?.length ? (
              <ul className="divide-y divide-border">
                {leaderboard.slice(0, 5).map((entry) => (
                  <li key={entry.studentId} className="px-5 py-3 flex items-center gap-3">
                    <Trophy size={16} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        #{entry.rank} {entry.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.score} points · {entry.averageAccuracy}% accuracy
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-muted-foreground">No leaderboard entries yet.</div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Student Progress</h3>
          <Card padding="none">
            {leaderboard?.length ? (
              <ul className="divide-y divide-border">
                {leaderboard.slice(0, 5).map((entry) => (
                  <li key={entry.studentId} className="px-5 py-3">
                    <p className="text-xs font-semibold text-foreground">{entry.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {entry.attempts} activities · {entry.averageAccuracy}% average accuracy
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-muted-foreground">No submitted work yet.</div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Live Sessions</h3>
          <Card padding="none">
            {activeLiveSessions.length ? (
              <ul className="divide-y divide-border">
                {activeLiveSessions.slice(0, 5).map((session) => (
                  <li key={session.id} className="px-5 py-3">
                    <p className="text-xs font-semibold text-foreground inline-flex items-center gap-2">
                      <Broadcast size={14} />
                      {session.vocabSet?.title ?? "Live activity"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {session.activityType} · PIN {session.pin} · {session._count?.players ?? 0} players
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-muted-foreground">No active live sessions.</div>
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Recent Classrooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classrooms?.slice(0, 3).map((classroom) => (
            <Card
              key={classroom.id}
              hover
              onClick={() => navigate(`/dashboard/classrooms/${classroom.id}`)}
              className="flex items-center gap-4 cursor-pointer"
            >
              <ChalkboardTeacher size={20} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{classroom.name}</p>
                <p className="text-xs text-muted-foreground">
                  {classroom._count?.classroomsMembers ?? 0} students
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ClassroomModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
