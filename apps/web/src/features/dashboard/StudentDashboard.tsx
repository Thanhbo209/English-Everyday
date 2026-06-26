import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  Fire,
  CheckCircle,
  Books,
  BookOpen,
  ArrowRight,
  Trophy,
  Target,
} from "@phosphor-icons/react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { DashboardStatCard, Badge, Button, Card, LoadingSpinner } from "../../components/ui";
import { useClassrooms } from "../../features/classroom/hooks/useClassrooms";

/* ── Mock data (remains for feed / goals) ───────────────────── */
const PROGRESS_SKILLS = [
  { skill: "Reading", pct: 78 },
  { skill: "Listening", pct: 65 },
  { skill: "Speaking", pct: 45 },
  { skill: "Writing", pct: 82 },
];

const DAILY_GOALS = [
  { id: "1", text: "Complete a grammar lesson", done: true },
  { id: "2", text: "Listen to 10-min audio", done: true },
  { id: "3", text: "Practice pronunciation", done: true },
  { id: "4", text: "Write a 100-word journal", done: false },
  { id: "5", text: "Review 20 vocabulary cards", done: false },
];

const RECENT_LESSONS = [
  {
    id: "1",
    title: "Present Perfect vs. Simple Past",
    topic: "Grammar",
    duration: "18 min",
  },
  {
    id: "2",
    title: "Business Email Phrases",
    topic: "Writing",
    duration: "12 min",
  },
  {
    id: "3",
    title: "Minimal Pairs Practice",
    topic: "Pronunciation",
    duration: "9 min",
  },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: classrooms, isLoading } = useClassrooms();

  const doneGoals = DAILY_GOALS.filter((g) => g.done).length;
  const totalGoals = DAILY_GOALS.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalXP = user?.xp ?? 0;
  const streakDays = user?.streak ?? 0;
  const totalClassrooms = classrooms?.length ?? 0;

  const STATS = [
    {
      label: "Total XP",
      value: totalXP.toLocaleString(),
      icon: <Star size={22} />,
      iconTone: "yellow" as const,
      trend: { value: "+120 this week", direction: "up" as const },
    },
    {
      label: "Day Streak",
      value: `${streakDays} days`,
      icon: <Fire size={22} />,
      iconTone: "orange" as const,
      trend: { value: "Keep it up!", direction: "up" as const },
    },
    {
      label: "Lessons Done",
      value: 24,
      icon: <CheckCircle size={22} />,
      iconTone: "green" as const,
      trend: { value: "+3 this week", direction: "up" as const },
    },
    {
      label: "Classrooms",
      value: totalClassrooms,
      icon: <Books size={22} />,
      iconTone: "blue" as const,
    },
  ];

  return (
    <div className="space-y-7">
      {/* ── Welcome banner & Breadcrumbs ── */}
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
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </nav>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <DashboardStatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Classrooms + Goals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Classrooms with progress bars */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              My Classrooms
            </h3>
            <button
              onClick={() => navigate("/dashboard/classrooms")}
              className="text-xs text-secondary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {totalClassrooms === 0 ? (
            <Card className="flex flex-col items-center justify-center py-10 text-center min-h-[220px]">
              <Books size={36} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No classrooms joined yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                You haven't joined any classrooms yet. Enter an invite code from your teacher to get started.
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
              {classrooms?.map((cls) => {
                // Generate a deterministic progress percentage between 30% and 90%
                const progress = ((cls.name.charCodeAt(0) % 7) + 3) * 10;
                return (
                  <Card
                    key={cls.id}
                    className="space-y-3 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => navigate(`/dashboard/classrooms/${cls.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {cls.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Teacher: {cls.teacher?.name ?? "Unknown"}
                        </p>
                      </div>
                      <Badge variant={cls.status === "ACTIVE" ? "success" : "warning"} className="shrink-0">
                        {cls.status}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="text-primary font-bold">Progress</span>
                        <span className="font-semibold text-foreground">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Daily Goals
            </h3>
            <span className="text-xs text-muted-foreground">
              {doneGoals}/{totalGoals} done
            </span>
          </div>

          <Card padding="none">
            {/* Mini progress cap */}
            <div className="h-1 bg-muted rounded-t-xl overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(doneGoals / totalGoals) * 100}%` }}
              />
            </div>

            <ul className="divide-y divide-border">
              {DAILY_GOALS.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="shrink-0">
                    {goal.done ? (
                      <CheckCircle
                        size={17}
                        weight="fill"
                        className="text-secondary"
                      />
                    ) : (
                      <Target size={17} className="text-muted-foreground" />
                    )}
                  </span>
                  <span
                    className={`text-sm ${goal.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {goal.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* ── Skills + Lessons ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Skill progress bars */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Skill Progress
          </h3>
          <Card className="space-y-5">
            {PROGRESS_SKILLS.map((p) => (
              <div key={p.skill}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">{p.skill}</span>
                  <span className="font-semibold text-foreground">
                    {p.pct}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-700"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Recent lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Recent Lessons
            </h3>
            <button className="text-xs text-secondary hover:text-primary/80 font-medium transition-colors cursor-pointer">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {RECENT_LESSONS.map((lesson) => (
              <Card
                key={lesson.id}
                hover
                className="flex items-center gap-4 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg border border-secondary bg-sidebar-accent text-primary flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.topic} · {lesson.duration}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                />
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── Continue learning CTA ── */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-primary/25 bg-primary/5">
        <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Trophy size={24} />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            Continue where you left off
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Present Perfect vs. Simple Past — 60% complete
          </p>
        </div>
        <Button size="sm">Resume Lesson</Button>
      </Card>
    </div>
  );
}
