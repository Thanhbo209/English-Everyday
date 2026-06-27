import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardRouter } from "../features/dashboard/DashboardRouter";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
/* Dashboard pages */
import ClassroomsPage from "../pages/dashboard/ClassroomsPage";
import ClassroomDetailPage from "../pages/dashboard/ClassroomDetailPage";
import JoinClassroomPage from "../pages/dashboard/JoinClassroomPage";
import StudentsPage from "../pages/dashboard/StudentsPage";
import AssignmentsPage from "../pages/dashboard/AssignmentsPage";
import ProgressPage from "../pages/dashboard/ProgressPage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import SettingsPage from "../pages/dashboard/SettingsPage";
import RoleGuard from "./RoleGuard";
import VocabSetsPage from "../pages/dashboard/VocabSetsPage";
import VocabSetDetailPage from "../pages/dashboard/VocabSetDetailPage";

export const router = createBrowserRouter([
  /* ── Public auth ── */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  /* ── Protected dashboard ── */
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      /* Role-aware index */
      { index: true, element: <DashboardRouter /> },
      /* Shared */
      { path: "classrooms", element: <ClassroomsPage /> },
      { path: "classrooms/:id", element: <ClassroomDetailPage /> },
      {
        path: "classrooms/join",
        element: (
          <RoleGuard roles={["STUDENT"]}>
            <JoinClassroomPage />
          </RoleGuard>
        ),
      },
      { path: "profile", element: <ProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      /* Teacher only */
      {
        path: "vocab-sets",
        element: (
          <RoleGuard roles={["TEACHER"]}>
            <VocabSetsPage />
          </RoleGuard>
        ),
      },
      {
        path: "vocab-sets/:id",
        element: (
          <RoleGuard roles={["TEACHER"]}>
            <VocabSetDetailPage />
          </RoleGuard>
        ),
      },
      { path: "students", element: <StudentsPage /> },
      { path: "assignments", element: <AssignmentsPage /> },
      /* Student only */
      { path: "progress", element: <ProgressPage /> },
    ],
  },

  /* ── Catch-all → redirect ── */
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
