import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardRouter } from "../features/dashboard/DashboardRouter";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
/* Dashboard pages */
import ClassroomsPage from "../pages/dashboard/shared/ClassroomsPage";
import ClassroomDetailPage from "../pages/dashboard/shared/ClassroomDetailPage";
import JoinClassroomPage from "../pages/dashboard/student/JoinClassroomPage";
import StudentsPage from "../pages/dashboard/teacher/StudentsPage";
import AssignmentsPage from "../pages/dashboard/teacher/AssignmentsPage";
import ProgressPage from "../pages/dashboard/student/ProgressPage";
import ProfilePage from "../pages/dashboard/shared/ProfilePage";
import SettingsPage from "../pages/dashboard/shared/SettingsPage";
import RoleGuard from "./RoleGuard";
import VocabSetsPage from "../pages/dashboard/teacher/VocabSetsPage";
import VocabSetDetailPage from "../pages/dashboard/teacher/VocabSetDetailPage";

/* Student Flashcard Suite Pages */
import LearnCardsPage from "../modules/flashcards/pages/LearnCardsPage";
import FlipCardsPage from "../modules/flashcards/pages/FlipCardsPage";
import SelfLearningPage from "../modules/flashcards/pages/SelfLearningPage";
import ListeningPage from "../modules/flashcards/pages/ListeningPage";
import HiddenMeaningPage from "../modules/flashcards/pages/HiddenMeaningPage";
import SpeakingCardsPage from "../modules/flashcards/pages/SpeakingCardsPage";
import AssessmentPage from "../modules/assessment/pages/AssessmentPage";

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
