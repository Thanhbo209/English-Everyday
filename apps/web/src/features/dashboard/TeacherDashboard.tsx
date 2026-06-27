import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Users,
  BookOpen,
  ChartLineUp,
  Plus,
  UserPlus,
  Key,
  CheckCircle,
  XCircle,
  Clock,
} from "@phosphor-icons/react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { DashboardStatCard, Badge, Button, Card, LoadingSpinner } from "../../components/ui";
import { useClassrooms } from "../../features/classroom/hooks/useClassrooms";
import { ClassroomModal } from "../../features/classroom/components/ClassroomModal";

/* ── Activity Mock (remains for feed) ───────────────────────── */
const ACTIVITY = [
  {
    id: "1",
    icon: <CheckCircle size={15} className="text-primary" />,
    text: 'Maria completed "Present Perfect" lesson',
    time: "5 min ago",
  },
  {
    id: "2",
    icon: <UserPlus size={15} className="text-accent-foreground" />,
    text: "David joined Business English classroom",
    time: "32 min ago",
  },
  {
    id: "3",
    icon: <XCircle size={15} className="text-destructive" />,
    text: 'Lesson "Reported Speech" scored below 60%',
    time: "1 hour ago",
  },
  {
    id: "4",
    icon: <CheckCircle size={15} className="text-primary" />,
    text: "12 students completed weekly quiz",
    time: "3 hours ago",
  },
  {
    id: "5",
    icon: <Clock size={15} className="text-muted-foreground" />,
    text: "Pronunciation Lab session starts in 1 hour",
    time: "4 hours ago",
  },
];

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: classrooms, isLoading } = useClassrooms();
  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
  const totalClassrooms = classrooms?.length ?? 0;
  const totalStudents = classrooms?.reduce((acc, c) => acc + (c._count?.classroomsMembers ?? 0), 0) ?? 0;
  const activeClassrooms = classrooms?.filter((c) => c.status === "ACTIVE").length ?? 0;

  const STATS = [
    {
      label: "Total Classrooms",
      value: totalClassrooms,
      icon: <ChalkboardTeacher size={22} />,
      iconTone: "yellow" as const,
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: <Users size={22} />,
      iconTone: "blue" as const,
    },
    {
      label: "Active Classrooms",
      value: activeClassrooms,
      icon: <BookOpen size={22} />,
      iconTone: "orange" as const,
    },
    {
      label: "Completion Rate",
      value: "89%",
      icon: <ChartLineUp size={22} />,
      iconTone: "green" as const,
      trend: { value: "+4% vs last month", direction: "up" as const },
    },
  ];

  const recentClassrooms = classrooms?.slice(0, 3) ?? [];

  return (
    <div className="space-y-7">
      {/* ── Welcome banner & Breadcrumbs ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{dateLabel}</p>
            <h2 className="text-2xl font-bold text-foreground">
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here is what is happening in your classrooms today.
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

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <DashboardStatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Classrooms + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Classrooms */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Recent Classrooms
            </h3>
            <button
              onClick={() => navigate("/dashboard/classrooms")}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              View all
            </button>
          </div>

          {recentClassrooms.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-10 text-center min-h-[180px]">
              <ChalkboardTeacher size={36} className="text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No classrooms created yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a classroom to invite your students and set up assignments.
              </p>
              <Button size="sm" className="mt-3.5" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                Create Classroom
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentClassrooms.map((cls) => (
                <Card
                  key={cls.id}
                  hover
                  onClick={() => navigate(`/dashboard/classrooms/${cls.id}`)}
                  className="flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center shrink-0">
                    <ChalkboardTeacher size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {cls.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cls._count?.classroomsMembers ?? 0} students · Code: {cls.joinCode}
                    </p>
                  </div>
                  <Badge variant={cls.status === "ACTIVE" ? "success" : "warning"}>
                    {cls.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Recent Activity
          </h3>
          <Card padding="none">
            <ul>
              {ACTIVITY.map((a, idx) => (
                <li
                  key={a.id}
                  className={`flex gap-3 px-5 py-4 ${idx !== ACTIVITY.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="mt-0.5 shrink-0">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {a.text}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {a.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            hover
            onClick={() => setModalOpen(true)}
            className="flex items-start gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Plus size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Create Classroom
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set up a new class with invite code
              </p>
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate("/dashboard/classrooms")}
            className="flex items-start gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Users size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Manage Classrooms
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                View status and members of classrooms
              </p>
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate("/dashboard/classrooms")}
            className="flex items-start gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Key size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Invite Codes
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Retrieve class codes to invite students
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Classroom Modal */}
      <ClassroomModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
