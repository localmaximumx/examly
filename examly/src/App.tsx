import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { getRouteForScreen } from './routes';
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
  const { role, lastTeacherScreen, lastStudentScreen } = useApp();
  const target = role === 'Teacher' ? (lastTeacherScreen || 'Teacher dashboard') : (lastStudentScreen || 'Student home');
  return <Navigate to={getRouteForScreen(target)} replace />;
};

const TeacherRedirect: React.FC = () => {
  const { lastTeacherScreen } = useApp();
  return <Navigate to={getRouteForScreen(lastTeacherScreen || 'Teacher dashboard')} replace />;
};

const StudentRedirect: React.FC = () => {
  const { lastStudentScreen } = useApp();
  return <Navigate to={getRouteForScreen(lastStudentScreen || 'Student home')} replace />;
};

const MainRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth screens (still available if directly needed) */}
      <Route path="/login/teacher" element={<LoginScreen role="Teacher" />} />
      <Route path="/login/student" element={<LoginScreen role="Student" />} />

      {/* Teacher workspace routes */}
      <Route path="/teacher" element={<TeacherRedirect />} />
      <Route path="/teacher/dashboard" element={<AppShell><DashboardScreen /></AppShell>} />
      <Route path="/teacher/examinations" element={<AppShell><ExamListScreen /></AppShell>} />
      <Route path="/teacher/examinations/create/general" element={<AppShell><CreateGeneralScreen /></AppShell>} />
      <Route path="/teacher/examinations/create/questions" element={<AppShell><CreateQuestionsScreen /></AppShell>} />
      <Route path="/teacher/examinations/create/settings" element={<AppShell><CreateSettingsScreen /></AppShell>} />
      <Route path="/teacher/examinations/preview" element={<AppShell><ExamPreviewScreen /></AppShell>} />
      <Route path="/teacher/examinations/details" element={<AppShell><LiveMonitoringScreen /></AppShell>} />
      <Route path="/teacher/examinations/start-confirmation" element={<AppShell><StartConfirmationScreen /></AppShell>} />
      <Route path="/teacher/monitoring" element={<AppShell><LiveMonitoringScreen /></AppShell>} />
      <Route path="/teacher/results" element={<AppShell><LiveMonitoringScreen /></AppShell>} />
      <Route path="/teacher/grading" element={<AppShell><IndividualGradingScreen /></AppShell>} />
      <Route path="/teacher/question-bank" element={<AppShell><QuestionBankScreen /></AppShell>} />
      <Route path="/teacher/classes" element={<AppShell><StudentsClassesScreen /></AppShell>} />
      <Route path="/teacher/classes/detail" element={<AppShell><ClassDetailScreen /></AppShell>} />
      <Route path="/teacher/students" element={<Navigate to="/teacher/classes" replace />} />
      <Route path="/teacher/reports" element={<AppShell><ReportsScreen /></AppShell>} />
      <Route path="/teacher/settings" element={<AppShell><SettingsScreen /></AppShell>} />
      <Route path="/teacher/activity-log" element={<AppShell><ActivityLogScreen /></AppShell>} />

      {/* Student portal routes */}
      <Route path="/student" element={<StudentRedirect />} />
      <Route path="/student/home" element={<AppShell><StudentHomeScreen /></AppShell>} />
      <Route path="/student/exam/instructions" element={<AppShell><ExamInstructionsScreen /></AppShell>} />
      <Route path="/student/exam/take" element={<AppShell><MainExaminationScreen /></AppShell>} />
      <Route path="/student/exam/interrupted" element={<AppShell><ConnectionInterruptionScreen /></AppShell>} />
      <Route path="/student/exam/submit-confirmation" element={<AppShell><SubmissionConfirmationScreen /></AppShell>} />
      <Route path="/student/exam/receipt" element={<AppShell><SubmissionReceiptScreen /></AppShell>} />
      <Route path="/student/history" element={<AppShell><StudentHistoryScreen /></AppShell>} />
      <Route path="/student/results" element={<AppShell><StudentResultScreen /></AppShell>} />

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
