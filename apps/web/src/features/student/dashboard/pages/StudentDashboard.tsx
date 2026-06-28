import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  Books,
  BookOpen,
  ArrowRight,
  Trophy,
  Target,
  ClipboardText,
  CheckCircle,
  Broadcast,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import {
  DashboardStatCard,
  Badge,
  Button,
  Card,
  LoadingSpinner,
} from "@/shared/components";
import { useClassrooms } from "@/features/teacher/classrooms";
import { useVocabSets } from "../vocab/hooks/useVocabs";
import { PracticeModal } from "@/features/student/activities/flashcard";
import type { VocabSet } from "@/features/teacher/vocab-builder/api/vocab.api";
import { useStudentAssignments } from "@/features/student/activities/flashcard";
import { useProgress } from "@/features/student/activities/flashcard";
import { useMastery } from "@/features/student/activities/flashcard";
import { useLeaderboard } from "@/features/student/activities/flashcard";
import { useLiveSessions } from "@/features/student/activities/flashcard";

const activityPath = (activityType: string, assignmentId: string) =>
  `/student/activities/${activityType.toLowerCase()}/assignments/${assignmentId}`;

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const { data: vocabSets, isLoading: loadingVocabSets } = useVocabSets();

  const { data: assignments, isLoading: loadingAssignments } =
    useStudentAssignments();
  const { data: progress, isLoading: loadingProgress } = useProgress();
  const { data: mastery, isLoading: loadingMastery } = useMastery();
  const primaryClassroomId = classrooms?.[0]?.id;
  const { data: leaderboard, isLoading: loadingLeaderboard } =
    useLeaderboard(primaryClassroomId);
  const { data: liveSessions, isLoading: loadingLiveSessions } =
    useLiveSessions();

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [selectedPracticeSet, setSelectedPracticeSet] =
    useState<VocabSet | null>(null);

  const isLoading =
    loadingClassrooms ||
    loadingAssignments ||
    loadingProgress ||
    loadingMastery ||
    loadingVocabSets ||
    loadingLeaderboard ||
    loadingLiveSessions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  const totalClassrooms = classrooms?.length ?? 0;
  const assignmentsDue =
    assignments?.filter((assignment) => !assignment.submissions?.length)
      .length ?? 0;
  const completionPercent =
    assignments && assignments.length > 0
      ? Math.round(
          ((assignments.length - assignmentsDue) / assignments.length) * 100,
        )
      : 0;
  const myRank = leaderboard?.find(
    (entry) => entry.studentId === user?.id,
  )?.rank;
  const upcomingLiveSessions =
    liveSessions?.filter(
      (session) => session.status === "WAITING" || session.status === "ACTIVE",
    ) ?? [];

  const STATS = [
    {
      label: "Total XP",
      value: (user?.xp ?? 0).toLocaleString(),
      icon: <Star size={22} />,
      iconTone: "yellow" as const,
    },
    {
      label: "Assignments Due",
      value: assignmentsDue,
      icon: <ClipboardText size={22} />,
      iconTone: "orange" as const,
    },
    {
      label: "Completion",
      value: `${completionPercent}%`,
      icon: <CheckCircle size={22} />,
      iconTone: "green" as const,
    },
    {
      label: "Leaderboard",
      value: myRank ? `#${myRank}` : "-",
      icon: <Trophy size={22} />,
      iconTone: "blue" as const,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Your learning hub
            </p>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          </div>
          <Button
            leftIcon={<BookOpen size={16} />}
            size="sm"
            onClick={() => navigate("/dashboard/classrooms")}
          >
            Continue Learning
          </Button>
        </div>

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2">
          <Link
            to="/dashboard"
            className="hover:text-foreground transition-colors"
          >
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
            <h3 className="text-base font-semibold text-foreground">
              Assignments Due
            </h3>
          </div>

          <div className="space-y-3">
            {assignmentsDue === 0 ? (
              <Card className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle size={34} className="text-secondary mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  All caught up
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted assignments will continue to build your progress and
                  mastery history.
                </p>
              </Card>
            ) : (
              assignments
                ?.filter((assignment) => !assignment.submissions?.length)
                .slice(0, 4)
                .map((assignment) => (
                  <Card
                    key={assignment.id}
                    hover
                    onClick={() =>
                      navigate(
                        activityPath(assignment.activityType, assignment.id),
                      )
                    }
                    className="flex items-center gap-4"
                  >
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
                        {assignment.vocabSet.title} ·{" "}
                        {assignment.vocabSet._count?.vocabItems ??
                          assignment.vocabSet.vocabItems?.length ??
                          0}{" "}
                        words
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground shrink-0"
                    />
                  </Card>
                ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Vocabulary Mastery
          </h3>
          <Card className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-secondary">
                  {mastery?.known ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground">Known</p>
              </div>
              <div>
                <p className="text-xl font-bold text-accent-foreground">
                  {mastery?.learning ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground">Learning</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {mastery?.new ?? 0}
                </p>
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
              {mastery?.percentages.known ?? 0}% of assigned vocabulary is
              known.
            </p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Progress</h3>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average accuracy
              </span>
              <span className="font-bold text-foreground">
                {progress?.accuracy ?? 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Best score</span>
              <span className="font-bold text-foreground">
                {progress?.bestScore ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Activities completed
              </span>
              <span className="font-bold text-foreground">
                {progress?.activitiesCompleted ?? 0}
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Recent Activities
          </h3>
          <Card padding="none">
            {progress?.history.length ? (
              <ul className="divide-y divide-border">
                {progress.history.slice(0, 4).map((record) => (
                  <li key={record.id} className="px-5 py-3">
                    <p className="text-xs font-semibold text-foreground">
                      {record.activityType} ·{" "}
                      {record.vocabSet?.title ?? "Vocabulary"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Score {record.score} · {record.accuracy}% accuracy
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-muted-foreground">
                No completed activities yet.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Upcoming Live Sessions
          </h3>
          <Card padding="none">
            {upcomingLiveSessions.length ? (
              <ul className="divide-y divide-border">
                {upcomingLiveSessions.slice(0, 4).map((session) => (
                  <li key={session.id} className="px-5 py-3">
                    <p className="text-xs font-semibold text-foreground inline-flex items-center gap-2">
                      <Broadcast size={14} />
                      {session.vocabSet?.title ?? "Live activity"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {session.activityType} · {session.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-muted-foreground">
                No active live sessions.
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            My Classrooms
          </h3>
          {totalClassrooms === 0 ? (
            <Card className="flex flex-col items-center justify-center py-10 text-center">
              <Books size={36} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                No classrooms joined yet
              </p>
              <Button
                size="sm"
                className="mt-4"
                leftIcon={<Target size={14} />}
                onClick={() => navigate("/dashboard/classrooms/join")}
              >
                Join Classroom
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {classrooms?.slice(0, 3).map((classroom) => (
                <Card
                  key={classroom.id}
                  hover
                  onClick={() =>
                    navigate(`/dashboard/classrooms/${classroom.id}`)
                  }
                  className="flex items-center gap-4"
                >
                  <Books size={20} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {classroom.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Teacher: {classroom.teacher?.name ?? "Unknown"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      classroom.status === "ACTIVE" ? "success" : "warning"
                    }
                  >
                    {classroom.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Vocabulary Decks
          </h3>
          <div className="space-y-3">
            {!vocabSets || vocabSets.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <Books size={32} className="text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No vocabulary decks assigned yet
                </p>
              </Card>
            ) : (
              vocabSets.slice(0, 3).map((set) => (
                <Card
                  key={set.id}
                  hover
                  onClick={() => {
                    setSelectedPracticeSet(set);
                    setPracticeOpen(true);
                  }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg border border-secondary bg-sidebar-accent text-primary flex items-center justify-center shrink-0">
                    <Books size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {set.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {set.language} · {set._count?.vocabItems ?? 0} words
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <PracticeModal
        open={practiceOpen}
        onClose={() => {
          setPracticeOpen(false);
          setSelectedPracticeSet(null);
        }}
        vocabSet={selectedPracticeSet}
      />
    </div>
  );
}
