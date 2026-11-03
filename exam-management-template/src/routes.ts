import { Screen } from './types';

export const SCREEN_TO_ROUTE: Record<Screen, string> = {
  // Auth
  'Teacher login': '/login/teacher',
  'Student login': '/login/student',
  'Student register': '/login/student',

  // Teacher Workspace
  'Teacher dashboard': '/teacher/dashboard',
  'Examination list': '/teacher/examinations',
  'Create exam – general information': '/teacher/examinations/create/general',
  'Create exam – questions': '/teacher/examinations/create/questions',
  'Create exam – settings': '/teacher/examinations/create/settings',
  'Exam preview': '/teacher/examinations/preview',
  'Exam details': '/teacher/examinations/details',
  'Start examination confirmation': '/teacher/examinations/start-confirmation',
  'Live monitoring': '/teacher/monitoring',
  'Results dashboard': '/teacher/results',
  'Individual result & grading': '/teacher/grading',
  'Question bank': '/teacher/question-bank',
  'Students & classes': '/teacher/classes',
  'Class detail': '/teacher/classes/detail',
  'Reports': '/teacher/reports',
  'Settings': '/teacher/settings',
  'Activity log': '/teacher/activity-log',

  // Student Portal
  'Student home': '/student/home',
  'Exam instructions': '/student/exam/instructions',
  'Main examination': '/student/exam/take',
  'Connection interruption': '/student/exam/interrupted',
  'Submission confirmation': '/student/exam/submit-confirmation',
  'Submission receipt': '/student/exam/receipt',
  'Student examination history': '/student/history',
  'Student result view': '/student/results'
};

export const ROUTE_TO_SCREEN: Record<string, Screen> = Object.entries(SCREEN_TO_ROUTE).reduce(
  (acc, [screen, route]) => {
    acc[route] = screen as Screen;
    return acc;
  },
  { '/teacher/students': 'Students & classes' } as Record<string, Screen>
);

export function getRouteForScreen(screen: Screen): string {
  return SCREEN_TO_ROUTE[screen] || '/teacher/dashboard';
}

export function getScreenForRoute(pathname: string): Screen | undefined {
  // exact match
  if (ROUTE_TO_SCREEN[pathname]) return ROUTE_TO_SCREEN[pathname];

  // normalized match without trailing slash
  const clean = pathname.replace(/\/+$/, '');
  if (ROUTE_TO_SCREEN[clean]) return ROUTE_TO_SCREEN[clean];

  return undefined;
}
