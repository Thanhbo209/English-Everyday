import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { DashboardRouter } from "@/features/teacher/dashboard";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

/* Auth pages */
import { LoginPage as Login, RegisterPage as Register, ProfilePage, SettingsPage } from "@/features/auth";

/* Classrooms pages */
import { ClassroomsPage, ClassroomDetailPage, StudentsPage } from "@/features/teacher/classrooms";

/* Assignments page */
import { AssignmentsPage } from "@/features/teacher/assignments";

/* Student pages */
import { JoinClassroomPage } from "@/features/student/task-list";
import { ProgressPage } from "@/features/student/dashboard";

/* Vocab Builder pages */
import { VocabSetsPage, VocabSetDetailPage } from "@/features/teacher/vocab-builder";

/* Student Immersive Flashcard Activities Pages */
import {
  LearnCardsPage,
  FlipCardsPage,
  SelfLearningPage,
  ListeningPage,
  HiddenMeaningPage,
  SpeakingCardsPage,
} from "@/features/student/activities/flashcard";

/* Student Assessment Page */
import { AssessmentPage } from "@/features/student/activities";

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
          <RoleGuard roles={["TEACHER", "STUDENT"]}>
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

  /* ── Student Immersive Flashcard Activities ── */
  {
    path: "/student/activities",
    element: (
      <ProtectedRoute>
        <RoleGuard roles={["STUDENT"]}>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
              <Outlet />
            </main>
          </div>
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: "a1/assignments/:assignmentId", element: <LearnCardsPage /> },
      { path: "a2/assignments/:assignmentId", element: <FlipCardsPage /> },
      { path: "a3/assignments/:assignmentId", element: <SelfLearningPage /> },
      { path: "a4/assignments/:assignmentId", element: <ListeningPage /> },
      { path: "a5/assignments/:assignmentId", element: <HiddenMeaningPage /> },
      { path: "a6/assignments/:assignmentId", element: <SpeakingCardsPage /> },
      { path: "a1/:vocabSetId", element: <LearnCardsPage /> },
      { path: "a2/:vocabSetId", element: <FlipCardsPage /> },
      { path: "a3/:vocabSetId", element: <SelfLearningPage /> },
      { path: "a4/:vocabSetId", element: <ListeningPage /> },
      { path: "a5/:vocabSetId", element: <HiddenMeaningPage /> },
      { path: "a6/:vocabSetId", element: <SpeakingCardsPage /> },
      {
        path: ":activityType/assignments/:assignmentId",
        element: <AssessmentPage />,
      },
    ],
  },

  /* ── Catch-all → redirect ── */
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
