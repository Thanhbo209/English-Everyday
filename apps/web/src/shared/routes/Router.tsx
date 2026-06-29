import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { DashboardRouter } from "@/features/teacher/dashboard";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

/* Auth pages */
import { LoginPage as Login, RegisterPage as Register, ProfilePage, SettingsPage } from "@/features/auth";

/* Classrooms pages */
import { ClassroomListPage, ClassroomWorkspacePage, StudentsPage } from "@/features/classrooms";

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

/* Phase 5 Word Game Pages */
import { UnscrambleTypePage, UnscrambleDragPage } from "@/features/student/activities/unscramble";
import { MatchMeaningPage } from "@/features/student/activities/match-pairs";
import { LetterFillPage } from "@/features/student/activities/letter-fill";
import { PairMatchPage } from "@/features/student/activities/pair-match";
import { ConnectPage } from "@/features/student/activities/connect";
import { WordSearchPage } from "@/features/student/activities/word-search";
import { HangmanPage } from "@/features/student/activities/hangman";

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
      { path: "classrooms", element: <ClassroomListPage /> },
      { path: "classrooms/:id", element: <ClassroomWorkspacePage /> },
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
      { path: "u1/assignments/:assignmentId", element: <UnscrambleTypePage /> },
      { path: "u2/assignments/:assignmentId", element: <UnscrambleDragPage /> },
      { path: "m1/assignments/:assignmentId", element: <MatchMeaningPage activityType="M1" /> },
      { path: "m2/assignments/:assignmentId", element: <MatchMeaningPage activityType="M2" /> },
      { path: "v1/assignments/:assignmentId", element: <LetterFillPage activityType="V1" /> },
      { path: "v2/assignments/:assignmentId", element: <LetterFillPage activityType="V2" /> },
      { path: "v3/assignments/:assignmentId", element: <LetterFillPage activityType="V3" /> },
      { path: "o1/assignments/:assignmentId", element: <PairMatchPage activityType="O1" /> },
      { path: "o2/assignments/:assignmentId", element: <PairMatchPage activityType="O2" /> },
      { path: "c1/assignments/:assignmentId", element: <ConnectPage activityType="C1" /> },
      { path: "c2/assignments/:assignmentId", element: <ConnectPage activityType="C2" /> },
      { path: "w1/assignments/:assignmentId", element: <WordSearchPage /> },
      { path: "h1/assignments/:assignmentId", element: <HangmanPage /> },
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
