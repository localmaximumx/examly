import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Screen, User, UserRole } from '../types';
import { authService } from '../services/auth.service';
import { storageService } from '../services/storage.service';
import { getRouteForScreen, getScreenForRoute, SCREEN_TO_ROUTE } from '../routes';
import { CustomAlertOptions } from '../components/common/CustomAlertModal';

interface AppContextType {
  user: User | null;
  role: UserRole;
  activeTeacher: User | null;
  activeStudent: User | null;
  screen: Screen;
  lastTeacherScreen: Screen;
  lastStudentScreen: Screen;
  mobileOpen: boolean;
  toast: string;
  examTitle: string;
  selectedExamId: string;
  dataVersion: number;
  theme: 'dark' | 'light';
  alertState: CustomAlertOptions | null;
  showAlert: (options: {
    title?: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
    confirmText?: string;
    onConfirm?: () => void;
  }) => void;
  showConfirm: (options: {
    title?: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeAlert: () => void;
  toggleTheme: () => void;
  refreshData: () => void;
  go: (next: Screen) => void;
  changeRole: (next: UserRole) => void;
  login: (username: string, role: UserRole, password?: string) => { success: boolean; message?: string };
  logout: (roleToLogout?: UserRole) => void;
  notify: (message: string) => void;
  setMobileOpen: (open: boolean) => void;
  setExamTitle: (title: string) => void;
  setSelectedExamId: (id: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  examClassScope: string | null;
  setExamClassScope: (cls: string | null) => void;
  selectedSubmissionId: string | null;
  setSelectedSubmissionId: (id: string | null) => void;
  selectedCompletedClass: string | null;
  setSelectedCompletedClass: (cls: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isTeacherScreen = (s?: Screen | null): boolean => {
  if (!s || !SCREEN_TO_ROUTE[s]) return false;
  return SCREEN_TO_ROUTE[s].startsWith('/teacher') && s !== 'Teacher login';
};

const isStudentScreen = (s?: Screen | null): boolean => {
  if (!s || !SCREEN_TO_ROUTE[s]) return false;
  return SCREEN_TO_ROUTE[s].startsWith('/student') && s !== 'Student login' && s !== 'Student register';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacherPath = location.pathname.startsWith('/teacher') || location.pathname === '/login/teacher';
  const isStudentPath = location.pathname.startsWith('/student') || location.pathname === '/login/student';

  const [activeTeacher, setActiveTeacher] = useState<User | null>(() => storageService.getCurrentTeacher());
  const [activeStudent, setActiveStudent] = useState<User | null>(() => storageService.getCurrentStudent());

  const [role, setRole] = useState<UserRole>(() => {
    if (isTeacherPath) return 'Teacher';
    if (isStudentPath) return 'Student';
    return storageService.getActiveRole();
  });

  const [user, setUser] = useState<User | null>(() => {
    if (isTeacherPath) return storageService.getCurrentTeacher();
    if (isStudentPath) return storageService.getCurrentStudent();
    return storageService.getCurrentUser();
  });

  // Derive initial screen from current URL path if valid
  const [screen, setScreen] = useState<Screen>(() => {
    const routeScreen = getScreenForRoute(location.pathname);
    if (routeScreen) return routeScreen;
    return isTeacherPath ? 'Teacher login' : 'Student login';
  });

  // Remember last visited page for each section
  const [lastTeacherScreen, setLastTeacherScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('examly_last_teacher_screen') as Screen | null;
    if (saved && isTeacherScreen(saved)) return saved;
    const initial = getScreenForRoute(location.pathname);
    return isTeacherScreen(initial) ? initial! : 'Teacher dashboard';
  });

  const [lastStudentScreen, setLastStudentScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('examly_last_student_screen') as Screen | null;
    if (saved && isStudentScreen(saved)) return saved;
    const initial = getScreenForRoute(location.pathname);
    return isStudentScreen(initial) ? initial! : 'Student home';
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [alertState, setAlertState] = useState<CustomAlertOptions | null>(null);
  const [examTitle, setExamTitle] = useState('Mathematics — Midterm Assessment');
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return localStorage.getItem('examly_selected_exam_id') || 'EXM-001';
  });
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return localStorage.getItem('examly_selected_class_id') || 'CLS-10A';
  });
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedCompletedClass, setSelectedCompletedClass] = useState<string | null>(null);
  const [examClassScope, setExamClassScope] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    if (selectedExamId) {
      localStorage.setItem('examly_selected_exam_id', selectedExamId);
      setSelectedCompletedClass(null);
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem('examly_selected_class_id', selectedClassId);
    }
  }, [selectedClassId]);

  const closeAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const showAlert = useCallback(
    (options: {
      title?: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'danger';
      confirmText?: string;
      onConfirm?: () => void;
    }) => {
      setAlertState({
        title: options.title || 'Attention',
        message: options.message,
        type: options.type || 'info',
        confirmText: options.confirmText || 'OK',
        isConfirm: false,
        onConfirm: options.onConfirm
      });
    },
    []
  );

  const showConfirm = useCallback(
    (options: {
      title?: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'danger';
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setAlertState({
        title: options.title || 'Please Confirm',
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isConfirm: true,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel
      });
    },
    []
  );

  // Theme state: Defaults to 'dark' for modern desktop/web
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('examly_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('examly_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }, []);

  // Sync state when browser navigation occurs & auto-login when entering sections
  useEffect(() => {
    const matchedScreen = getScreenForRoute(location.pathname);
    if (!matchedScreen) return;

    setScreen(matchedScreen);

    if (isTeacherScreen(matchedScreen)) {
      setRole('Teacher');
      storageService.setActiveRole('Teacher');
      const teacher = storageService.getCurrentTeacher();
      if (!teacher) {
        setUser(null);
        setScreen('Teacher login');
        navigate('/login/teacher');
        return;
      }
      setUser(teacher);
      setActiveTeacher(teacher);
      setLastTeacherScreen(matchedScreen);
      localStorage.setItem('examly_last_teacher_screen', matchedScreen);
    } else if (isStudentScreen(matchedScreen)) {
      setRole('Student');
      storageService.setActiveRole('Student');
      const student = storageService.getCurrentStudent();
      if (!student) {
        setUser(null);
        setScreen('Student login');
        navigate('/login/student');
        return;
      }
      setUser(student);
      setActiveStudent(student);
      setLastStudentScreen(matchedScreen);
      localStorage.setItem('examly_last_student_screen', matchedScreen);
    } else if (location.pathname === '/login/teacher' || location.pathname === '/teacher/login') {
      setRole('Teacher');
      const teacher = storageService.getCurrentTeacher();
      setUser(teacher);
      setActiveTeacher(teacher);
    } else if (location.pathname === '/login/student' || location.pathname === '/student/login') {
      setRole('Student');
      const student = storageService.getCurrentStudent();
      setUser(student);
      setActiveStudent(student);
    }
  }, [location.pathname]);

  const go = useCallback((next: Screen) => {
    const targetRoute = getRouteForScreen(next);
    if (isTeacherScreen(next)) {
      setRole('Teacher');
      storageService.setActiveRole('Teacher');
      const teacher = storageService.getCurrentTeacher();
      if (!teacher) {
        setUser(null);
        setScreen('Teacher login');
        setMobileOpen(false);
        navigate('/login/teacher');
        return;
      }
      setUser(teacher);
      setActiveTeacher(teacher);
      setLastTeacherScreen(next);
      localStorage.setItem('examly_last_teacher_screen', next);
    } else if (isStudentScreen(next)) {
      setRole('Student');
      storageService.setActiveRole('Student');
      const student = storageService.getCurrentStudent();
      if (!student) {
        setUser(null);
        setScreen('Student login');
        setMobileOpen(false);
        navigate('/login/student');
        return;
      }
      setUser(student);
      setActiveStudent(student);
      setLastStudentScreen(next);
      localStorage.setItem('examly_last_student_screen', next);
    }

    setScreen(next);
    setMobileOpen(false);
    navigate(targetRoute);
  }, [navigate]);

  const changeRole = useCallback((nextRole: UserRole) => {
    if (nextRole === 'Teacher') {
      setRole('Teacher');
      storageService.setActiveRole('Teacher');
      const teacherUser = storageService.getCurrentTeacher();
      if (teacherUser) {
        setUser(teacherUser);
        setActiveTeacher(teacherUser);
        const savedTeacher = (localStorage.getItem('examly_last_teacher_screen') as Screen) || 'Teacher dashboard';
        const targetScreen = isTeacherScreen(savedTeacher) ? savedTeacher : 'Teacher dashboard';
        setScreen(targetScreen);
        setLastTeacherScreen(targetScreen);
        localStorage.setItem('examly_last_teacher_screen', targetScreen);
        navigate(getRouteForScreen(targetScreen));
        notify(`Switched to Teacher: ${teacherUser.name}`);
      } else {
        setUser(null);
        setScreen('Teacher login');
        navigate('/login/teacher');
      }
    } else {
      setRole('Student');
      storageService.setActiveRole('Student');
      const studentUser = storageService.getCurrentStudent();
      if (studentUser) {
        setUser(studentUser);
        setActiveStudent(studentUser);
        const savedStudent = (localStorage.getItem('examly_last_student_screen') as Screen) || 'Student home';
        const targetScreen = isStudentScreen(savedStudent) ? savedStudent : 'Student home';
        setScreen(targetScreen);
        setLastStudentScreen(targetScreen);
        localStorage.setItem('examly_last_student_screen', targetScreen);
        navigate(getRouteForScreen(targetScreen));
        notify(`Switched to Student: ${studentUser.name}`);
      } else {
        setUser(null);
        setScreen('Student login');
        navigate('/login/student');
      }
    }
  }, [navigate, notify]);

  const login = useCallback(
    (username: string, loginRole: UserRole, password?: string): { success: boolean; message?: string } => {
      const res = authService.login(username, loginRole, password);
      if (res.success && res.user) {
        setUser(res.user);
        setRole(loginRole);
        storageService.setActiveRole(loginRole);
        if (loginRole === 'Teacher') {
          setActiveTeacher(res.user);
          const savedTeacher = (localStorage.getItem('examly_last_teacher_screen') as Screen) || 'Teacher dashboard';
          const targetScreen = isTeacherScreen(savedTeacher) ? savedTeacher : 'Teacher dashboard';
          setScreen(targetScreen);
          setLastTeacherScreen(targetScreen);
          localStorage.setItem('examly_last_teacher_screen', targetScreen);
          navigate(getRouteForScreen(targetScreen));
        } else {
          setActiveStudent(res.user);
          const savedStudent = (localStorage.getItem('examly_last_student_screen') as Screen) || 'Student home';
          const targetScreen = isStudentScreen(savedStudent) ? savedStudent : 'Student home';
          setScreen(targetScreen);
          setLastStudentScreen(targetScreen);
          localStorage.setItem('examly_last_student_screen', targetScreen);
          navigate(getRouteForScreen(targetScreen));
        }
        notify(`Welcome back, ${res.user.name}!`);
        return { success: true };
      }
      const errorMsg = res.message || 'Login failed. Please verify credentials.';
      notify(errorMsg);
      return { success: false, message: errorMsg };
    },
    [navigate, notify]
  );

  const logout = useCallback((roleToLogout?: UserRole) => {
    const targetRole = roleToLogout || role;
    authService.logout(targetRole);
    if (targetRole === 'Teacher') {
      setActiveTeacher(null);
      if (role === 'Teacher') {
        setUser(null);
        setScreen('Teacher login');
        navigate('/login/teacher');
      }
    } else {
      setActiveStudent(null);
      if (role === 'Student') {
        setUser(null);
        setScreen('Student login');
        navigate('/login/student');
      }
    }
    notify(`Signed out of ${targetRole} portal.`);
  }, [role, navigate, notify]);

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        activeTeacher,
        activeStudent,
        screen,
        lastTeacherScreen,
        lastStudentScreen,
        mobileOpen,
        toast,
        examTitle,
        selectedExamId,
        dataVersion,
        theme,
        alertState,
        showAlert,
        showConfirm,
        closeAlert,
        toggleTheme,
        refreshData,
        go,
        changeRole,
        login,
        logout,
        notify,
        setMobileOpen,
        setExamTitle,
        setSelectedExamId,
        selectedClassId,
        setSelectedClassId,
        examClassScope,
        setExamClassScope,
        selectedSubmissionId,
        setSelectedSubmissionId,
        selectedCompletedClass,
        setSelectedCompletedClass
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
