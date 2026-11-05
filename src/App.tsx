import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getRouteForScreen } from './routes';
import { storageService } from './services/storage.service';
import './styles.css';
import './dark-mode.css';
import './typography.css';

// Teacher Screens
import { LoginScreen } from './pages/auth/LoginScreen';
import { DashboardScreen } from './pages/teacher/DashboardScreen';
import { ExamListScreen } from './pages/teacher/ExamListScreen';
import { CreateGeneralScreen } from './pages/teacher/CreateGeneralScreen';
import { CreateQuestionsScreen } from './pages/teacher/CreateQuestionsScreen';
import { CreateSettingsScreen } from './pages/teacher/CreateSettingsScreen';
import { ExamPreviewScreen } from './pages/teacher/ExamPreviewScreen';
import { ExamDetailsScreen } from './pages/teacher/ExamDetailsScreen';
import { StartConfirmationScreen } from './pages/teacher/StartConfirmationScreen';
import { LiveMonitoringScreen } from './pages/teacher/LiveMonitoringScreen';
import { ResultsScreen } from './pages/teacher/ResultsScreen';
import { IndividualGradingScreen } from './pages/teacher/IndividualGradingScreen';
import { QuestionBankScreen } from './pages/teacher/QuestionBankScreen';
import { StudentsClassesScreen } from './pages/teacher/StudentsClassesScreen';
import { ClassDetailScreen } from './pages/teacher/ClassDetailScreen';
import { ReportsScreen } from './pages/teacher/ReportsScreen';
import { SettingsScreen } from './pages/teacher/SettingsScreen';
import { ActivityLogScreen } from './pages/teacher/ActivityLogScreen';

// Student Screens
import { StudentHomeScreen } from './pages/student/StudentHomeScreen';
import { ExamInstructionsScreen } from './pages/student/ExamInstructionsScreen';
import { MainExaminationScreen } from './pages/student/MainExaminationScreen';
import { ConnectionInterruptionScreen } from './pages/student/ConnectionInterruptionScreen';
import { SubmissionConfirmationScreen } from './pages/student/SubmissionConfirmationScreen';
import { SubmissionReceiptScreen } from './pages/student/SubmissionReceiptScreen';
import { StudentHistoryScreen } from './pages/student/StudentHistoryScreen';
import { StudentResultScreen } from './pages/student/StudentResultScreen';

const RootRedirect: React.FC = () => {
  const activeRole = storageService.getActiveRole();
  const teacher = storageService.getCurrentTeacher();
  const student = storageService.getCurrentStudent();
  const { lastTeacherScreen, lastStudentScreen } = useApp();

  if (activeRole === 'Teacher' && teacher) {
    return <Navigate to={getRouteForScreen(lastTeacherScreen || 'Teacher dashboard')} replace />;
  }
  if (activeRole === 'Student' && student) {
    return <Navigate to={getRouteForScreen(lastStudentScreen || 'Student home')} replace />;
  }
  if (teacher) {
    return <Navigate to={getRouteForScreen(lastTeacherScreen || 'Teacher dashboard')} replace />;
  }
  if (student) {
    return <Navigate to={getRouteForScreen(lastStudentScreen || 'Student home')} replace />;
  }
  return <Navigate to="/login/teacher" replace />;
};

// Security Route Guards: Strictly isolate teacher and student access
const RequireTeacher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const teacher = storageService.getCurrentTeacher();
  const activeRole = storageService.getActiveRole();
  if (!teacher || activeRole !== 'Teacher') {
    return <Navigate to="/login/teacher" replace />;
  }
  return <>{children}</>;
};

const RequireStudent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const student = storageService.getCurrentStudent();
  const activeRole = storageService.getActiveRole();
  if (!student || activeRole !== 'Student') {
    return <Navigate to="/login/student" replace />;
  }
  return <>{children}</>;
};

const TeacherRedirect: React.FC = () => {
  const teacher = storageService.getCurrentTeacher();
  const activeRole = storageService.getActiveRole();
  const { lastTeacherScreen } = useApp();
  if (!teacher || activeRole !== 'Teacher') {
    return <Navigate to="/login/teacher" replace />;
  }
  return <Navigate to={getRouteForScreen(lastTeacherScreen || 'Teacher dashboard')} replace />;
};

const StudentRedirect: React.FC = () => {
  const student = storageService.getCurrentStudent();
  const activeRole = storageService.getActiveRole();
  const { lastStudentScreen } = useApp();
  if (!student || activeRole !== 'Student') {
    return <Navigate to="/login/student" replace />;
  }
  return <Navigate to={getRouteForScreen(lastStudentScreen || 'Student home')} replace />;
};

const MainRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth screens */}
      <Route path="/login/teacher" element={<LoginScreen role="Teacher" />} />
      <Route path="/teacher/login" element={<LoginScreen role="Teacher" />} />
      <Route path="/login/student" element={<LoginScreen role="Student" />} />
      <Route path="/student/login" element={<LoginScreen role="Student" />} />

      {/* Teacher workspace routes (Strictly protected by RequireTeacher) */}
      <Route path="/teacher" element={<TeacherRedirect />} />
      <Route path="/teacher/dashboard" element={<RequireTeacher><AppShell><DashboardScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations" element={<RequireTeacher><AppShell><ExamListScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/create/general" element={<RequireTeacher><AppShell><CreateGeneralScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/create/questions" element={<RequireTeacher><AppShell><CreateQuestionsScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/create/settings" element={<RequireTeacher><AppShell><CreateSettingsScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/preview" element={<RequireTeacher><AppShell><ExamPreviewScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/details" element={<RequireTeacher><AppShell><LiveMonitoringScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/examinations/start-confirmation" element={<RequireTeacher><AppShell><StartConfirmationScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/monitoring" element={<RequireTeacher><AppShell><LiveMonitoringScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/results" element={<RequireTeacher><AppShell><LiveMonitoringScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/grading" element={<RequireTeacher><AppShell><IndividualGradingScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/question-bank" element={<RequireTeacher><AppShell><QuestionBankScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/classes" element={<RequireTeacher><AppShell><StudentsClassesScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/classes/detail" element={<RequireTeacher><AppShell><ClassDetailScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/students" element={<Navigate to="/teacher/classes" replace />} />
      <Route path="/teacher/reports" element={<RequireTeacher><AppShell><ReportsScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/settings" element={<RequireTeacher><AppShell><SettingsScreen /></AppShell></RequireTeacher>} />
      <Route path="/teacher/activity-log" element={<RequireTeacher><AppShell><ActivityLogScreen /></AppShell></RequireTeacher>} />

      {/* Student portal routes (Strictly protected by RequireStudent) */}
      <Route path="/student" element={<StudentRedirect />} />
      <Route path="/student/home" element={<RequireStudent><AppShell><StudentHomeScreen /></AppShell></RequireStudent>} />
      <Route path="/student/exam/instructions" element={<RequireStudent><AppShell><ExamInstructionsScreen /></AppShell></RequireStudent>} />
      <Route path="/student/exam/take" element={<RequireStudent><AppShell><MainExaminationScreen /></AppShell></RequireStudent>} />
      <Route path="/student/exam/interrupted" element={<RequireStudent><AppShell><ConnectionInterruptionScreen /></AppShell></RequireStudent>} />
      <Route path="/student/exam/submit-confirmation" element={<RequireStudent><AppShell><SubmissionConfirmationScreen /></AppShell></RequireStudent>} />
      <Route path="/student/exam/receipt" element={<RequireStudent><AppShell><SubmissionReceiptScreen /></AppShell></RequireStudent>} />
      <Route path="/student/history" element={<RequireStudent><AppShell><StudentHistoryScreen /></AppShell></RequireStudent>} />
      <Route path="/student/results" element={<RequireStudent><AppShell><StudentResultScreen /></AppShell></RequireStudent>} />

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <MainRouter />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
