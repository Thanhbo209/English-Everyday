const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

const srcDir = path.resolve(__dirname, 'src');
const files = getFiles(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  const isTeacher = file.includes('teacher');

  // Replace utility functions path
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+lib\/utils(['\"])/g, '$1@/shared/utils/utils$2');

  // Replace UI components
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+components\/ui(['\"])/g, '$1@/shared/components$2');
  content = content.replace(/(from\s+['\"])\.\.\/components\/ui(['\"])/g, '$1@/shared/components$2');

  // Replace Layouts
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+layouts\/(DashboardLayout|Sidebar|Topbar)(['\"])/g, '$1@/shared/layouts/$2$3');

  // Replace Axios
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+api\/axios(['\"])/g, '$1@/shared/api/axios$2');

  // Replace Auth Context / Provider / Hooks
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+features\/auth\/hooks\/useAuth(['\"])/g, '$1@/features/auth$2');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+features\/auth\/auth.context(['\"])/g, '$1@/features/auth/auth.context$2');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+features\/auth\/auth.provider(['\"])/g, '$1@/features/auth$2');

  // Replace classroom api and hooks
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+api\/classroom.api(['\"])/g, '$1@/features/teacher/classrooms/api/classroom.api$2');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+features\/classroom\/hooks\/useClassrooms(['\"])/g, '$1@/features/teacher/classrooms$2');

  // Replace vocab api and hooks
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+api\/vocab.api(['\"])/g, '$1@/features/teacher/vocab-builder/api/vocab.api$2');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+features\/vocab\/hooks\/useVocabs(['\"])/g, '$1@/features/teacher/vocab-builder$2');

  // Replace auth api
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+api\/auth.api(['\"])/g, '$1@/features/auth/api/auth.api$2');

  // Replace learning api
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+api\/learning.api(['\"])/g, '$1@/features/student/dashboard/api/learning.api$2');

  // Replace Route Guards & Router imports
  content = content.replace(/(from\s+['\"])\.\/ProtectedRoute(['\"])/g, '$1@/shared/routes$2');
  content = content.replace(/(from\s+['\"])\.\/RoleGuard(['\"])/g, '$1@/shared/routes$2');
  content = content.replace(/(from\s+['\"])\.\.\/layouts\/DashboardLayout(['\"])/g, '$1@/shared/layouts/DashboardLayout$2');
  content = content.replace(/(from\s+['\"])\.\.\/features\/dashboard\/DashboardRouter(['\"])/g, '$1@/features/teacher/dashboard$2');

  // Pages imports inside Router.tsx / components
  content = content.replace(/(from\s+['\"])\.\.\/pages\/auth\/Login(['\"])/g, '$1@/features/auth$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/auth\/Register(['\"])/g, '$1@/features/auth$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/shared\/ClassroomsPage(['\"])/g, '$1@/features/teacher/classrooms$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/shared\/ClassroomDetailPage(['\"])/g, '$1@/features/teacher/classrooms$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/student\/JoinClassroomPage(['\"])/g, '$1@/features/student/task-list$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/teacher\/StudentsPage(['\"])/g, '$1@/features/teacher/classrooms$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/teacher\/AssignmentsPage(['\"])/g, '$1@/features/teacher/assignments$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/student\/ProgressPage(['\"])/g, '$1@/features/student/dashboard$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/shared\/ProfilePage(['\"])/g, '$1@/features/auth$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/shared\/SettingsPage(['\"])/g, '$1@/features/auth$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/teacher\/VocabSetsPage(['\"])/g, '$1@/features/teacher/vocab-builder$2');
  content = content.replace(/(from\s+['\"])\.\.\/pages\/dashboard\/teacher\/VocabSetDetailPage(['\"])/g, '$1@/features/teacher/vocab-builder$2');

  // Flashcards & Assessment pages imports inside Router.tsx / pages
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/LearnCardsPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/FlipCardsPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/SelfLearningPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/ListeningPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/HiddenMeaningPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/flashcards\/pages\/SpeakingCardsPage(['\"])/g, '$1@/features/student/activities/flashcard$2');
  content = content.replace(/(from\s+['\"])\.\.\/modules\/assessment\/pages\/AssessmentPage(['\"])/g, '$1@/features/student/activities$2');

  // Flashcard hooks & components imports
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+modules\/flashcards\/hooks\/useAssignment(['\"])/g, (m, p1, p2) => {
    return isTeacher ? `${p1}@/features/teacher/assignments${p2}` : `${p1}@/features/student/activities/flashcard${p2}`;
  });
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+modules\/flashcards\/hooks\/(\w+)(['\"])/g, '$1@/features/student/activities/flashcard$3');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+modules\/flashcards\/components\/(\w+)(['\"])/g, '$1@/features/student/activities/flashcard$3');

  // Assessment hooks, components, utils, types imports inside assessment files
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+types(['\"])/g, '$1../types$2');
  content = content.replace(/(from\s+['\"])(?:\.\.\/)+utils\/(\w+)(['\"])/g, '$1../utils/$2$3');
  content = content.replace(/(from\s+['\"])\.\.\/components\/(\w+)(['\"])/g, '$1../components/$2$3');
  content = content.replace(/(from\s+['\"])\.\.\/hooks\/(\w+)(['\"])/g, '$1../hooks/$2$3');
  
  // Resolve other cross-module imports
  content = content.replace(/(from\s+['\"])\.\.\/TeacherDashboard(['\"])/g, '$1./TeacherDashboard$2');
  content = content.replace(/(from\s+['\"])\.\/TeacherDashboard(['\"])/g, '$1./TeacherDashboard$2');
  content = content.replace(/(from\s+['\"])\.\.\/StudentDashboard(['\"])/g, '$1./StudentDashboard$2');
  content = content.replace(/(from\s+['\"])\.\/StudentDashboard(['\"])/g, '$1./StudentDashboard$2');
  content = content.replace(/(from\s+['\"])\.\.\/components\/ui(['\"])/g, '$1@/shared/components$2');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${path.relative(srcDir, file)}`);
  }
}
