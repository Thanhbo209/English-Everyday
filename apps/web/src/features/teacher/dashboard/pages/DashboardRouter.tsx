import { useAuth } from '@/features/auth';
import { TeacherDashboard } from "./TeacherDashboard";
import { StudentDashboard } from '@/features/student/dashboard';
import { PageSpinner } from "@/shared/components";

/**
 * Routes to the correct dashboard based on the authenticated user's role.
 * Falls back to a spinner while the auth state is resolving.
 */
export function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (user?.role === "TEACHER") return <TeacherDashboard />;
  if (user?.role === "STUDENT") return <StudentDashboard />;

  // Unexpected role — show teacher view as default
  return <TeacherDashboard />;
}
