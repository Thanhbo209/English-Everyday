import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Books,
  BookOpen,
  ClipboardText,
  CheckCircle,
  Broadcast,
  Fire,
  Calendar,
  Sparkle,
  Trophy,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card } from "@/shared/components";
import { useClassrooms } from "@/features/classrooms";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import { PracticeModal } from "@/features/student/activities/flashcard";
import type { VocabSet } from "@/features/teacher/vocab-builder/api/vocab.api";
import { useStudentAssignments } from "@/features/student/activities/flashcard";
import { useProgress } from "@/features/student/activities/flashcard";
import { useMastery } from "@/features/student/activities/flashcard";
import { useLeaderboard } from "@/shared/hooks/useLeaderboard";
import { useLiveSessions } from "@/features/student/activities/flashcard";
import {
  StatCard,
  ProgressCard,
  ChartCard,
  LeaderboardCard,
  TaskCard,
  SectionHeader,
  DashboardGrid,
  SkeletonCard,
  RecentActivityCard,
} from "@/shared/components/dashboard";

const activityPath = (activityType: string, assignmentId: string) =>
  `/student/activities/${activityType.toLowerCase()}/assignments/${assignmentId}`;

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const { data: vocabSets, isLoading: loadingVocabSets } = useVocabSets();
  const { data: assignments, isLoading: loadingAssignments } = useStudentAssignments();
  const { data: progress, isLoading: loadingProgress } = useProgress();
  const { data: mastery, isLoading: loadingMastery } = useMastery();

  const primaryClassroomId = classrooms?.[0]?.id;
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(primaryClassroomId);
  const { data: liveSessions, isLoading: loadingLiveSessions } = useLiveSessions();

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [selectedPracticeSet, setSelectedPracticeSet] = useState<VocabSet | null>(null);
  const [sortBy, setSortBy] = useState<"dueDate" | "title">("dueDate");

  const isLoading =
    loadingClassrooms ||
    loadingAssignments ||
    loadingProgress ||
    loadingMastery ||
    loadingVocabSets ||
    loadingLeaderboard ||
    loadingLiveSessions;

  // Filter out pending assignments
  const pendingAssignments = useMemo(() => {
    if (!assignments) return [];
    const items = assignments.filter((a) => !a.submissions?.length);
    if (sortBy === "dueDate") {
      items.sort((a, b) => {
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
    } else {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }
    return items;
  }, [assignments, sortBy]);

  // Calculate Streak & Goals
  const streak = 3; // simulated/calculated streak
  const xpGoal = 100;
  const todayXp = (user?.xp ?? 0) % 100; // current daily progress
  const goalPercent = Math.min(Math.round((todayXp / xpGoal) * 100), 100);

  // Map progress history for chart plotting
  const chartDataPoints = useMemo(() => {
    if (!progress?.history) return [];
    return progress.history.slice(0, 10).map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      value: record.score,
    })).reverse();
  }, [progress]);

  // Map progress items for recent activity timeline
  const activityTimelineItems = useMemo(() => {
    if (!progress?.history) return [];
    return progress.history.slice(0, 5).map((record) => ({
      id: record.id,
      type: "SUBMISSION" as const,
      title: `${record.activityType} Practice completed`,
      subtitle: `Vocab Set: ${record.vocabSet?.title ?? "Vocabulary"} · Score: ${record.score} · Accuracy: ${record.accuracy}%`,
      timestamp: record.recordedAt,
    }));
  }, [progress]);

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


  const assignmentsDue = pendingAssignments.length;
  const completionPercent =
    assignments && assignments.length > 0
      ? Math.round(((assignments.length - assignmentsDue) / assignments.length) * 100)
      : 0;

  const myRank = leaderboard?.find((entry) => entry.studentId === user?.id)?.rank;

  const upcomingLiveSessions =
    liveSessions?.filter((session) => session.status === "WAITING" || session.status === "ACTIVE") ?? [];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome & Section Header */}
      <SectionHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Student"}!`}
        description="Jump into practice to grow your streak and climb the leaderboard."
        category="Your learning hub"
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Dashboard" }]}
        action={
          <Button
            leftIcon={<BookOpen size={16} />}
            size="sm"
            onClick={() => navigate("/dashboard/classrooms")}
            className="cursor-pointer"
          >
            Continue Learning
          </Button>
        }
      />

      {/* Daily Motivation & Goal Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 animate-bounce">
            <Sparkle size={32} weight="fill" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-lg font-black text-foreground">You are doing fantastic!</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Consistency is key to mastering a language. Spend 10 minutes practice today to secure your streak."
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-around md:justify-center gap-4 shrink-0 bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Fire size={22} className="text-orange-500 fill-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground leading-none">Streak</p>
                <p className="text-lg font-extrabold text-foreground mt-1 leading-none">{streak} Days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={22} className="text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground leading-none">Daily Goal</p>
                <p className="text-lg font-extrabold text-foreground mt-1 leading-none">{goalPercent}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 7: Quick Continue Widget */}
        <Card className="p-6 flex flex-col justify-between border border-primary/25 bg-primary/5 rounded-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-wider">Quick Resume</span>
            <h4 className="text-base font-bold text-foreground">
              {pendingAssignments.length > 0 ? pendingAssignments[0].title : "All Caught Up!"}
            </h4>
            <p className="text-xs text-muted-foreground leading-snug">
              {pendingAssignments.length > 0
                ? `Activity: ${pendingAssignments[0].activityType} · Deck: ${pendingAssignments[0].vocabSet.title}`
                : "No outstanding classroom tasks. You can practice vocabulary sets directly below."}
            </p>
          </div>
          {pendingAssignments.length > 0 && (
            <Button
              size="sm"
              onClick={() => navigate(activityPath(pendingAssignments[0].activityType, pendingAssignments[0].id))}
              className="mt-4 w-full cursor-pointer"
            >
              Resume Activity
            </Button>
          )}
        </Card>
      </div>

      {/* Overview stats cards */}
      <DashboardGrid cols={4}>
        <StatCard
          label="Total XP"
          value={(user?.xp ?? 0).toLocaleString()}
          icon={<Star size={24} />}
          iconTone="yellow"
        />
        <StatCard
          label="Assignments Due"
          value={assignmentsDue}
          icon={<ClipboardText size={24} />}
          iconTone="orange"
        />
        <StatCard
          label="Completion"
          value={`${completionPercent}%`}
          icon={<CheckCircle size={24} />}
          iconTone="green"
        />
        <StatCard
          label="Leaderboard Rank"
          value={myRank ? `#${myRank}` : "-"}
          icon={<Trophy size={24} />}
          iconTone="blue"
        />
      </DashboardGrid>

      {/* Main split content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 2: My Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Assignments Due</h3>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="space-y-3">
            {pendingAssignments.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle size={34} className="text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-foreground">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nice job! Return here when your teacher publishes new assignments.
                </p>
              </Card>
            ) : (
              pendingAssignments.slice(0, 4).map((assignment) => (
                <TaskCard
                  key={assignment.id}
                  id={assignment.id}
                  title={assignment.title}
                  activityType={assignment.activityType}
                  vocabSetTitle={assignment.vocabSet.title}
                  wordsCount={
                    assignment.vocabSet._count?.vocabItems ??
                    assignment.vocabSet.vocabItems?.length ??
                    0
                  }
                  dueAt={assignment.dueAt}
                  status="PENDING"
                  onAction={() => navigate(activityPath(assignment.activityType, assignment.id))}
                />
              ))
            )}
          </div>
        </div>

        {/* Section 5: Leaderboard */}
        <LeaderboardCard
          entries={leaderboard ?? []}
          currentUserId={user?.id}
          title="Classroom Standings"
        />
      </div>

      {/* Section 4: Learning History SVG line chart & Section 6: Recent Activity timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Learning History"
            description="Score milestones earned across your recent practice activities"
            type="score"
            dataPoints={chartDataPoints}
          />
        </div>

        <RecentActivityCard
          activities={activityTimelineItems}
          title="My Learning Log"
        />
      </div>

      {/* Section 3: Vocabulary Mastery Progress */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Vocabulary Mastery</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!vocabSets || vocabSets.length === 0 ? (
            <Card className="col-span-3 flex flex-col items-center justify-center p-8 text-center border-dashed">
              <Books size={32} className="text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-muted-foreground">
                No vocabulary decks assigned yet
              </p>
            </Card>
          ) : (
            vocabSets.slice(0, 3).map((set) => {
              // Extract known/learning percentages mapping to the set or use global mastery defaults
              const setPercent = {
                known: mastery?.percentages.known ?? 0,
                learning: mastery?.percentages.learning ?? 0,
                new: mastery?.percentages.new ?? 100,
              };

              return (
                <ProgressCard
                  key={set.id}
                  title={set.title}
                  subtitle={`${set.language}`}
                  known={mastery?.known ?? 0}
                  learning={mastery?.learning ?? 0}
                  newCount={mastery?.new ?? 0}
                  total={set._count?.vocabItems ?? 0}
                  percentages={setPercent}
                  onClick={() => {
                    setSelectedPracticeSet(set);
                    setPracticeOpen(true);
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Extra: Live Sessions list */}
      {upcomingLiveSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Upcoming Live Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingLiveSessions.slice(0, 3).map((session) => (
              <Card
                key={session.id}
                className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Broadcast size={20} className="text-purple-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground truncate">
                      {session.vocabSet?.title ?? "Live Activity"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      PIN: {session.pin} · {session.activityType}
                    </p>
                  </div>
                </div>
                <Badge variant="info">Join</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

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
