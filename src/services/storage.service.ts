import {
  Examination,
  Student,
  ClassGroup,
  ClassInvitation,
  ExaminationSubmission,
  ActivityLogItem,
  Question,
  User,
  UserRole,
  ExamJoinRequest
} from '../types';
import {
  SEED_EXAMINATIONS,
  SEED_STUDENTS,
  SEED_CLASSES,
  SEED_SUBMISSIONS,
  SEED_ACTIVITY_LOGS,
  SEED_QUESTION_BANK,
  SEED_TEACHERS
} from '../data/seedData';
import { formatDisplayDate } from '../utils/date.utils';
import { supabaseSync } from '../lib/supabaseSync';

const STORAGE_KEYS = {
  EXAMS: 'examly_exams',
  STUDENTS: 'examly_students',
  TEACHERS: 'examly_teachers',
  CLASSES: 'examly_classes',
  CLASS_INVITATIONS: 'examly_class_invitations',
  SUBMISSIONS: 'examly_submissions',
  ACTIVITY_LOGS: 'examly_activity_logs',
  QUESTION_BANK: 'examly_question_bank',
  CURRENT_USER: 'examly_current_user',
  CURRENT_TEACHER: 'examly_current_teacher',
  CURRENT_STUDENT: 'examly_current_student',
  ACTIVE_ROLE: 'examly_active_role',
  JOIN_REQUESTS: 'examly_join_requests',
  STUDENT_ANSWERS: 'examly_student_answers',
  SETTINGS: 'examly_settings'
};

export function isSameClass(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanB = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanA === cleanB) return true;
  const stripA = cleanA.replace(/^grade/, '');
  const stripB = cleanB.replace(/^grade/, '');
  return stripA === stripB;
}

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`[StorageService] Failed to load key "${key}", returning default`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageService] Failed to save key "${key}"`, e);
    }
  }

  // Initialize seed data if not present or migrate old dummy data
  public initialize(): void {
    const CURRENT_DATA_VERSION = 'examly_demo_showcase_v7_clean';
    if (localStorage.getItem('examly_data_version') !== CURRENT_DATA_VERSION) {
      this.resetToDefault();
      localStorage.setItem('examly_data_version', CURRENT_DATA_VERSION);
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      this.saveExams(SEED_EXAMINATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.saveStudents(SEED_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      this.saveClasses(SEED_CLASSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      this.saveSubmissions(SEED_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
      this.saveActivityLogs(SEED_ACTIVITY_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTION_BANK)) {
      this.saveQuestionBank(SEED_QUESTION_BANK);
    }
  }

  public resetToDefault(): void {
    localStorage.clear();
    this.saveExams(SEED_EXAMINATIONS);
    this.saveStudents(SEED_STUDENTS);
    this.saveClasses(SEED_CLASSES);
    this.saveSubmissions(SEED_SUBMISSIONS);
    this.saveActivityLogs(SEED_ACTIVITY_LOGS);
    this.saveQuestionBank(SEED_QUESTION_BANK);
    this.saveCurrentUser(null);
    this.saveCurrentTeacher(null);
    this.saveCurrentStudent(null);
    localStorage.setItem('examly_selected_exam_id', 'EXM-001');
    localStorage.setItem('examly_selected_class_id', 'CLS-10A');
    localStorage.setItem('examly_data_version', 'examly_demo_showcase_v7_clean');
  }

  // Exams
  public getExams(): Examination[] {
    const exams = this.getItem<Examination[]>(STORAGE_KEYS.EXAMS, SEED_EXAMINATIONS);
    const students = this.getStudents();
    const submissions = this.getItem<ExaminationSubmission[]>(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    return exams.map(e => {
      // Collect all assigned class names
      const assignedClasses: string[] = [];
      if (e.assignedClassNames && Array.isArray(e.assignedClassNames)) {
        e.assignedClassNames.forEach(c => {
          if (c && c !== 'Unassigned' && !assignedClasses.includes(c)) {
            assignedClasses.push(c);
          }
        });
      }
      if (e.className && e.className !== 'Unassigned') {
        e.className.split(',').forEach(c => {
          const trimmed = c.trim();
          if (trimmed && trimmed !== 'Unassigned' && !assignedClasses.includes(trimmed)) {
            assignedClasses.push(trimmed);
          }
        });
      }

      const isUnassigned = assignedClasses.length === 0;
      const effectiveClassName = isUnassigned ? 'Unassigned' : assignedClasses.join(', ');

      const assignedClassesLower = assignedClasses.map(c => c.toLowerCase());
      const classStudents = isUnassigned
        ? []
        : students.filter(s => s.className && assignedClassesLower.includes(s.className.toLowerCase()));

      const dynamicCount = classStudents.length;
      const dynamicStudentIds = classStudents.map(s => s.id);

      let teacherUsername = e.teacherUsername;
      let teacherName = e.teacherName;
      if (!teacherUsername || teacherUsername === 'faculty') {
        if (e.id === 'EXM-004' || e.id === 'EXM-005') {
          teacherUsername = 'daniel.mengistu';
          teacherName = 'Daniel Mengistu';
        } else if (e.id === 'EXM-001' || e.id === 'EXM-002' || e.id === 'EXM-003') {
          teacherUsername = 'bethlehem.worku';
          teacherName = 'Bethlehem Worku';
        }
      }

      return {
        ...e,
        teacherUsername,
        teacherName,
        className: effectiveClassName,
        examDate: formatDisplayDate(e.examDate),
        assignedClassNames: isUnassigned
          ? []
          : assignedClasses,
        assignedStudentCount: dynamicCount,
        assignedStudentIds: isUnassigned
          ? []
          : (e.assignedStudentIds && e.assignedStudentIds.length > 0 ? e.assignedStudentIds : dynamicStudentIds)
      };
    });
  }

  public saveExams(exams: Examination[]): void {
    this.setItem(STORAGE_KEYS.EXAMS, exams);
  }

  public getExamById(id: string): Examination | undefined {
    return this.getExams().find(e => e.id === id || e.code === id);
  }

  public saveExam(exam: Examination): void {
    const exams = this.getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.unshift(exam);
    }
    this.saveExams(exams);
  }

  public deleteExam(id: string): void {
    const exams = this.getExams().filter(e => e.id !== id && e.code !== id);
    this.saveExams(exams);
  }

  // Official Synchronized Exam Starting
  public startExamOfficial(examId: string): Examination | undefined {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return undefined;

    const now = Date.now();
    const durationMin = exam.durationMinutes || parseInt(exam.duration, 10) || 60;
    exam.status = 'Active';
    exam.durationMinutes = durationMin;
    exam.startedAt = now;
    exam.endTime = now + (durationMin * 60 * 1000);
    exam.updatedAt = new Date().toISOString();

    this.saveExams(exams);

    this.addActivityLog({
      action: `Official exam session started for "${exam.title}" (${durationMin} min timer active)`,
      user: this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'teal',
      examId: exam.id
    });

    return exam;
  }

  // Extend Exam Session Time (Add extra minutes dynamically)
  public extendExamTime(examId: string, additionalMinutes: number): Examination | undefined {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return undefined;

    const addMs = additionalMinutes * 60 * 1000;
    const now = Date.now();
    if (!exam.endTime || exam.endTime < now) {
      exam.endTime = now + addMs;
    } else {
      exam.endTime += addMs;
    }

    const currentDuration = exam.durationMinutes || parseInt(exam.duration, 10) || 60;
    exam.durationMinutes = currentDuration + additionalMinutes;
    exam.duration = `${exam.durationMinutes} min`;
    exam.updatedAt = new Date().toISOString();

    this.saveExams(exams);

    this.addActivityLog({
      action: `Teacher extended exam timer by +${additionalMinutes} min for "${exam.title}"`,
      user: this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'teal',
      examId: exam.id
    });

    return exam;
  }

  // Unified Official Timer
  public getExamRemainingSeconds(examId: string): number {
    const exam = this.getExamById(examId);
    if (!exam || exam.status !== 'Active') {
      const defaultMin = exam?.durationMinutes || 60;
      return defaultMin * 60;
    }
    if (exam.isPaused) {
      return exam.pausedRemainingSeconds ?? ((exam.durationMinutes || 60) * 60);
    }
    if (!exam.endTime) {
      const durationMin = exam.durationMinutes || 60;
      exam.startedAt = Date.now();
      exam.endTime = Date.now() + (durationMin * 60 * 1000);
      this.saveExam(exam);
      return durationMin * 60;
    }
    const remainingMs = exam.endTime - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  // Teacher Pause / Resume Official Timer
  public toggleExamPause(examId: string): { success: boolean; isPaused: boolean; exam?: Examination } {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam || exam.status !== 'Active') return { success: false, isPaused: false };

    if (exam.isPaused) {
      // Resume timer
      const remainingSec = exam.pausedRemainingSeconds ?? ((exam.durationMinutes || 60) * 60);
      exam.isPaused = false;
      exam.endTime = Date.now() + (remainingSec * 1000);
      delete exam.pausedRemainingSeconds;
      exam.updatedAt = new Date().toISOString();
      this.saveExams(exams);

      this.addActivityLog({
        action: `Resumed examination timer for "${exam.title}"`,
        user: this.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'teal',
        examId: exam.id
      });
      return { success: true, isPaused: false, exam };
    } else {
      // Pause timer
      const remainingSec = this.getExamRemainingSeconds(examId);
      exam.isPaused = true;
      exam.pausedRemainingSeconds = remainingSec;
      exam.updatedAt = new Date().toISOString();
      this.saveExams(exams);

      this.addActivityLog({
        action: `Paused examination timer for "${exam.title}" (${remainingSec}s remaining)`,
        user: this.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'orange',
        examId: exam.id
      });
      return { success: true, isPaused: true, exam };
    }
  }

  // Join Requests Workflow (Student sends permission -> Teacher approves)
  public getJoinRequests(examId?: string): ExamJoinRequest[] {
    const all = this.getItem<ExamJoinRequest[]>(STORAGE_KEYS.JOIN_REQUESTS, []);
    if (!examId) return all;
    return all.filter(r => r.examId === examId);
  }

  public saveJoinRequests(requests: ExamJoinRequest[]): void {
    this.setItem(STORAGE_KEYS.JOIN_REQUESTS, requests);
  }

  public sendJoinRequest(params: {
    examId: string;
    studentId: string;
    studentName: string;
    studentUsername: string;
    className: string;
  }): ExamJoinRequest {
    const requests = this.getJoinRequests();
    const existing = requests.find(r => r.examId === params.examId && (r.studentId === params.studentId || r.studentUsername === params.studentUsername));
    if (existing) {
      existing.status = 'Pending';
      existing.requestedAt = new Date().toISOString();
      this.saveJoinRequests(requests);
      return existing;
    }

    const newRequest: ExamJoinRequest = {
      id: `JR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      examId: params.examId,
      studentId: params.studentId,
      studentName: params.studentName,
      studentUsername: params.studentUsername,
      className: params.className,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    this.saveJoinRequests(requests);

    this.addActivityLog({
      action: `${params.studentName} requested permission to join exam`,
      user: params.studentName,
      timestamp: 'Just now',
      color: 'blue',
      examId: params.examId
    });

    return newRequest;
  }

  public approveJoinRequest(requestId: string): void {
    const requests = this.getJoinRequests();
    const req = requests.find(r => r.id === requestId);
    if (req) {
      req.status = 'Approved';
      this.saveJoinRequests(requests);
      this.addActivityLog({
        action: `Teacher accepted join request for ${req.studentName}`,
        user: this.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'teal',
        examId: req.examId
      });
    }
  }

  public rejectJoinRequest(requestId: string): void {
    const requests = this.getJoinRequests();
    const req = requests.find(r => r.id === requestId);
    if (req) {
      req.status = 'Rejected';
      this.saveJoinRequests(requests);
    }
  }

  public approveAllJoinRequests(examId: string): void {
    const requests = this.getJoinRequests();
    let count = 0;
    requests.forEach(r => {
      if (r.examId === examId && r.status === 'Pending') {
        r.status = 'Approved';
        count++;
      }
    });
    this.saveJoinRequests(requests);
    if (count > 0) {
      this.addActivityLog({
        action: `Teacher approved ${count} student join requests for exam room`,
        user: this.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'teal',
        examId
      });
    }
  }

  public getStudentJoinStatus(examId: string, studentId: string): 'Not Requested' | 'Pending' | 'Approved' | 'Rejected' {
    const requests = this.getJoinRequests();
    const req = requests.find(r => r.examId === examId && (r.studentId === studentId || r.studentUsername === studentId));
    if (!req) return 'Not Requested';
    return req.status;
  }

  // Students & Registration
  public getStudents(): Student[] {
    let list = this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    if (!list || list.length === 0) return SEED_STUDENTS;
    // Always filter out deleted legacy profiles
    const cleanList = list.filter(
      s => s.username.toLowerCase() !== 'abel.tesfaye' &&
           !s.username.toLowerCase().includes('abebe') &&
           s.name.toLowerCase() !== 'abel tesfaye' &&
           !s.name.toLowerCase().includes('abebe')
    );
    let added = cleanList.length !== list.length;
    list = cleanList;

    const existingIds = new Set(list.map(s => s.id));
    const existingUsernames = new Set(list.map(s => s.username));
    SEED_STUDENTS.forEach(seed => {
      if (!existingIds.has(seed.id) && !existingUsernames.has(seed.username)) {
        list.push(seed);
        added = true;
      }
    });
    // Auto-normalize gradeLevel & section for legacy records
    list.forEach(st => {
      if (!st.gradeLevel && st.className) {
        const match = st.className.match(/Grade\s*\d+/i);
        if (match) {
          st.gradeLevel = match[0];
          added = true;
        }
      }
      if (!st.section && st.className && st.gradeLevel) {
        const sec = st.className.replace(st.gradeLevel, '').trim();
        if (sec) {
          st.section = sec;
          added = true;
        }
      }
    });
    if (added) {
      this.setItem(STORAGE_KEYS.STUDENTS, list);
    }
    return list;
  }

  public saveStudents(students: Student[]): void {
    this.setItem(STORAGE_KEYS.STUDENTS, students);
  }

  public saveStudent(student: Student): void {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === student.id || s.studentId === student.studentId);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.unshift(student);
    }
    this.saveStudents(students);
  }

  // Teachers
  public getTeachers(): User[] {
    const list = this.getItem<User[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    // Always filter out deleted legacy teacher profile
    let cleanList = list.filter(
      t => t.username.toLowerCase() !== 'alemu.tadesse' &&
           t.name.toLowerCase() !== 'alemu tadesse'
    );
    let modified = cleanList.length !== list.length;
    cleanList = cleanList.slice();
    SEED_TEACHERS.forEach(seed => {
      if (!cleanList.some(t => t.username.toLowerCase() === seed.username.toLowerCase())) {
        cleanList.push(seed);
        modified = true;
      }
    });
    if (modified) {
      this.saveTeachers(cleanList);
    }
    return cleanList;
  }

  public saveTeachers(teachers: User[]): void {
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);
  }

  public registerTeacher(data: {
    name: string;
    username: string;
    password?: string;
  }): User {
    const teachers = this.getTeachers();
    const cleanUsername = data.username.trim().toLowerCase();
    const newTeacher: User = {
      id: `TCH-${Date.now().toString().slice(-4)}`,
      username: cleanUsername,
      name: data.name.trim(),
      role: 'Teacher',
      password: data.password || 'examly-demo',
      avatarText: data.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      email: `${cleanUsername}@examly.edu`,
      enrollmentStatus: 'Enrolled'
    };

    teachers.unshift(newTeacher);
    this.saveTeachers(teachers);

    // Sync to Supabase cloud
    supabaseSync.syncUserToCloud(newTeacher, newTeacher.password);

    this.addActivityLog({
      action: `New teacher ${newTeacher.name} (@${newTeacher.username}) registered`,
      user: newTeacher.name,
      timestamp: 'Just now',
      color: 'blue'
    });

    return newTeacher;
  }

  public registerStudent(data: {
    name: string;
    studentId?: string;
    username: string;
    password?: string;
    gradeLevel?: string;
    section?: string;
    requestedClass?: string;
    className?: string;
  }): Student {
    const students = this.getStudents();
    const assignedId = data.studentId?.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const gradeLevel = data.gradeLevel?.trim() || 'Grade 10';
    const section = data.section?.trim() || 'Section A';
    const sectionLetter = section.replace(/^Section\s*/i, '').trim();
    const computedClass = `${gradeLevel}${sectionLetter}`;
    const requested = data.requestedClass || computedClass;

    const newStudent: Student = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      studentId: assignedId,
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      password: data.password || 'examly-demo',
      gradeLevel: gradeLevel, // Primary profile grade level
      section: section,
      requestedClass: requested,
      enrollmentStatus: 'Pending',
      className: 'Unassigned', // CANNOT automatically be member of that class!
      status: 'Active',
      connectionStatus: 'Connected',
      submissionStatus: 'Not submitted'
    };

    students.unshift(newStudent);
    this.saveStudents(students);

    // Automatically create a pending class invitation so teachers see it under the class
    const invitations = this.getClassInvitations();
    const newInvitation: ClassInvitation = {
      id: `INV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      classId: `CLS-${requested.replace(/\s+/g, '-').toUpperCase()}`,
      className: requested,
      teacherName: 'Class Faculty',
      teacherUsername: '',
      studentUsername: newStudent.username,
      studentName: newStudent.name,
      studentId: newStudent.studentId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    invitations.unshift(newInvitation);
    this.saveClassInvitations(invitations);

    // Sync to Supabase cloud
    supabaseSync.syncUserToCloud(newStudent, newStudent.password);

    this.addActivityLog({
      action: `New student ${newStudent.name} (${newStudent.studentId}) registered requesting ${requested} (Pending Approval)`,
      user: newStudent.name,
      timestamp: 'Just now',
      color: 'teal'
    });

    return newStudent;
  }

  public approveStudentClassEnrollment(
    studentUsername: string,
    className: string
  ): { success: boolean; message: string; student?: Student } {
    const students = this.getStudents();
    const cleanUser = studentUsername.trim().toLowerCase();
    const student = students.find(s => s.username.toLowerCase() === cleanUser);
    if (!student) {
      return { success: false, message: `Student @${studentUsername} not found.` };
    }

    student.className = className;
    student.requestedClass = className;
    student.enrollmentStatus = 'Enrolled';
    this.saveStudents(students);

    // Update corresponding class invitations
    const invitations = this.getClassInvitations();
    invitations.forEach(inv => {
      if (inv.studentUsername.toLowerCase() === cleanUser && inv.className.toLowerCase() === className.toLowerCase()) {
        inv.status = 'Accepted';
      }
    });
    this.saveClassInvitations(invitations);

    // Update active session if student is currently the logged-in user
    const cur = this.getCurrentStudent();
    if (cur && cur.username.toLowerCase() === cleanUser) {
      cur.className = className;
      cur.classId = className;
      cur.requestedClass = className;
      cur.enrollmentStatus = 'Enrolled';
      this.saveCurrentStudent(cur);
      this.saveCurrentUser(cur);
    }

    // Auto-enroll in exams assigned to this classroom
    const allExams = this.getItem<Examination[]>(STORAGE_KEYS.EXAMS, []);
    const targetClassLower = className.toLowerCase();
    let examsChanged = false;
    allExams.forEach(ex => {
      const isExamAssigned =
        (ex.className && ex.className.toLowerCase() === targetClassLower) ||
        (ex.assignedClassNames && ex.assignedClassNames.some(c => c.toLowerCase() === targetClassLower));
      if (isExamAssigned) {
        const idSet = new Set<string>(ex.assignedStudentIds || []);
        if (student.id) idSet.add(student.id);
        if (student.studentId) idSet.add(student.studentId);
        ex.assignedStudentIds = Array.from(idSet);
        examsChanged = true;
      }
    });
    if (examsChanged) {
      this.saveExams(allExams);
    }

    // Sync to Supabase cloud
    supabaseSync.syncUserToCloud(student, student.password);

    this.addActivityLog({
      action: `Teacher approved and enrolled ${student.name} (@${student.username}) into ${className}`,
      user: this.getCurrentTeacher()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'teal'
    });

    return {
      success: true,
      message: `Enrolled ${student.name} into ${className} successfully!`,
      student
    };
  }

  public rejectStudentClassEnrollment(studentUsername: string): { success: boolean; message: string } {
    const students = this.getStudents();
    const cleanUser = studentUsername.trim().toLowerCase();
    const student = students.find(s => s.username.toLowerCase() === cleanUser);
    if (!student) {
      return { success: false, message: `Student @${studentUsername} not found.` };
    }

    student.enrollmentStatus = 'Unassigned';
    this.saveStudents(students);

    // Update corresponding class invitations
    const invitations = this.getClassInvitations();
    invitations.forEach(inv => {
      if (inv.studentUsername.toLowerCase() === cleanUser) {
        inv.status = 'Declined';
      }
    });
    this.saveClassInvitations(invitations);

    // Sync to Supabase cloud
    supabaseSync.syncUserToCloud(student, student.password);

    this.addActivityLog({
      action: `Teacher declined enrollment request for ${student.name} (@${student.username})`,
      user: this.getCurrentTeacher()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'orange'
    });

    return { success: true, message: `Declined request for ${student.name}.` };
  }

  public findStudentById(id: string): Student | undefined {
    if (!id || !id.trim()) return undefined;
    const students = this.getStudents();
    const raw = id.trim().toLowerCase();
    const clean = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return students.find(st => {
      const stId = (st.studentId || '').toLowerCase();
      const stIdClean = (st.studentId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const sId = (st.id || '').toLowerCase();
      const sIdClean = (st.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const uName = (st.username || '').toLowerCase();
      return (
        raw === stId ||
        clean === stIdClean ||
        raw === sId ||
        clean === sIdClean ||
        raw === uName
      );
    });
  }

  public enrollStudentsToClassByIds(
    classId: string,
    className: string,
    ids: string[]
  ): {
    enrolled: Student[];
    notFound: string[];
    alreadyEnrolled: Student[];
  } {
    const students = this.getStudents();
    const enrolled: Student[] = [];
    const notFound: string[] = [];
    const alreadyEnrolled: Student[] = [];

    const cleanIds = Array.from(new Set(ids.map(id => id.trim()).filter(Boolean)));

    cleanIds.forEach(id => {
      const raw = id.toLowerCase();
      const clean = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const student = students.find(st => {
        const stId = (st.studentId || '').toLowerCase();
        const stIdClean = (st.studentId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const sId = (st.id || '').toLowerCase();
        const sIdClean = (st.id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const uName = (st.username || '').toLowerCase();
        return (
          raw === stId ||
          clean === stIdClean ||
          raw === sId ||
          clean === sIdClean ||
          raw === uName
        );
      });

      if (!student) {
        notFound.push(id);
      } else if (student.className && student.className.toLowerCase() === className.toLowerCase()) {
        alreadyEnrolled.push(student);
      } else {
        // Teacher enrolls student into a class cohort.
        // Primary grade level is preserved from user profile and is NOT overridden by the teacher.
        if (!student.gradeLevel && student.className) {
          const match = student.className.match(/Grade\s*\d+/i);
          if (match) student.gradeLevel = match[0];
        }
        student.className = className;
        enrolled.push(student);
      }
    });

    if (enrolled.length > 0) {
      this.saveStudents(students);
      this.addActivityLog({
        action: `Enrolled ${enrolled.length} student${enrolled.length === 1 ? '' : 's'} into ${className}`,
        user: this.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'blue'
      });
    }

    return { enrolled, notFound, alreadyEnrolled };
  }

  // Classes
  public getClasses(): ClassGroup[] {
    const classes = this.getItem<ClassGroup[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const students = this.getStudents();
    return classes.map(c => ({
      ...c,
      studentCount: students.filter(s => s.className === c.name).length
    }));
  }

  public saveClasses(classes: ClassGroup[]): void {
    this.setItem(STORAGE_KEYS.CLASSES, classes);
  }

  public createClass(name: string, academicYear: string = '2026/2027'): { success: boolean; message: string; classGroup?: ClassGroup } {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, message: 'Class name cannot be empty.' };
    }
    const classes = this.getItem<ClassGroup[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    if (classes.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: `A class named "${trimmed}" already exists.` };
    }

    const gradeMatch = trimmed.match(/(\d+)/);
    const gradeLevel = gradeMatch ? parseInt(gradeMatch[1], 10) : undefined;
    const currentUser = this.getCurrentTeacher() || this.getCurrentUser();

    const newClass: ClassGroup = {
      id: `CLS-${Date.now().toString().slice(-4)}`,
      name: trimmed,
      academicYear,
      studentCount: 0,
      gradeLevel,
      teacherUsername: currentUser?.username || ''
    };

    classes.push(newClass);
    this.saveClasses(classes);

    this.addActivityLog({
      action: `Created new classroom "${newClass.name}" (${academicYear})`,
      user: currentUser?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'teal'
    });

    return { success: true, message: `Classroom "${newClass.name}" created successfully.`, classGroup: newClass };
  }

  public deleteClass(classIdOrName: string): { success: boolean; message: string } {
    const raw = (classIdOrName || '').trim();
    if (!raw) return { success: false, message: 'Class identifier is required.' };

    const classes = this.getItem<ClassGroup[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const targetIndex = classes.findIndex(
      c => c.id.toLowerCase() === raw.toLowerCase() || c.name.toLowerCase() === raw.toLowerCase()
    );

    if (targetIndex === -1) {
      return { success: false, message: `Classroom "${raw}" not found.` };
    }

    const targetClass = classes[targetIndex];
    classes.splice(targetIndex, 1);
    this.saveClasses(classes);

    // Update any student who was in this class to 'Unassigned'
    const students = this.getStudents();
    let studentsUpdated = false;
    students.forEach(st => {
      if (st.className && st.className.toLowerCase() === targetClass.name.toLowerCase()) {
        st.className = 'Unassigned';
        st.enrollmentStatus = 'Unassigned';
        studentsUpdated = true;
        // Sync updated student cloud record
        supabaseSync.syncUserToCloud(st, st.password);
      }
    });
    if (studentsUpdated) {
      this.saveStudents(students);
    }

    // Clean up invitations for this class
    const invitations = this.getClassInvitations();
    const remainingInvitations = invitations.filter(
      inv => inv.className.toLowerCase() !== targetClass.name.toLowerCase() && inv.classId.toLowerCase() !== targetClass.id.toLowerCase()
    );
    if (remainingInvitations.length !== invitations.length) {
      this.saveClassInvitations(remainingInvitations);
    }

    // Cloud sync removal
    supabaseSync.deleteClassroomFromCloud(targetClass.id);

    // Update any active student session if needed
    const curStudent = this.getCurrentStudent();
    if (curStudent && curStudent.className?.toLowerCase() === targetClass.name.toLowerCase()) {
      curStudent.className = 'Unassigned';
      curStudent.enrollmentStatus = 'Unassigned';
      this.saveCurrentStudent(curStudent);
    }

    this.addActivityLog({
      action: `Teacher deleted classroom "${targetClass.name}"`,
      user: this.getCurrentTeacher()?.name || this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'orange'
    });

    return { success: true, message: `Classroom "${targetClass.name}" deleted successfully.` };
  }

  // Class Invitations
  public getClassInvitations(studentUsername?: string): ClassInvitation[] {
    const list = this.getItem<ClassInvitation[]>(STORAGE_KEYS.CLASS_INVITATIONS, []);
    if (!studentUsername) return list;
    const lower = studentUsername.trim().toLowerCase();
    return list.filter(inv => inv.studentUsername.toLowerCase() === lower);
  }

  public saveClassInvitations(invitations: ClassInvitation[]): void {
    this.setItem(STORAGE_KEYS.CLASS_INVITATIONS, invitations);
  }

  public sendClassInvitation(params: {
    classId?: string;
    className: string;
    studentUsername: string;
  }): { success: boolean; message: string; invitation?: ClassInvitation } {
    const username = params.studentUsername.trim().toLowerCase();
    if (!username) {
      return { success: false, message: 'Please provide a student username.' };
    }

    const students = this.getStudents();
    const student = students.find(s => s.username.toLowerCase() === username);
    if (!student) {
      return {
        success: false,
        message: `Student with username "${params.studentUsername}" was not found in the student directory.`
      };
    }

    if (student.className.toLowerCase() === params.className.toLowerCase()) {
      return {
        success: false,
        message: `${student.name} is already enrolled in ${params.className}.`
      };
    }

    const invitations = this.getClassInvitations();
    const pending = invitations.find(
      inv =>
        inv.studentUsername.toLowerCase() === username &&
        inv.className.toLowerCase() === params.className.toLowerCase() &&
        inv.status === 'Pending'
    );
    if (pending) {
      return {
        success: false,
        message: `An invitation to join ${params.className} is already pending for ${student.name}.`
      };
    }

    const currentUser = this.getCurrentTeacher() || this.getCurrentUser();
    const newInvitation: ClassInvitation = {
      id: `INV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      classId: params.classId || `CLS-${params.className.replace(/\s+/g, '-').toUpperCase()}`,
      className: params.className,
      teacherName: currentUser?.name || 'Teacher',
      teacherUsername: currentUser?.username || '',
      studentUsername: student.username,
      studentName: student.name,
      studentId: student.studentId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    invitations.unshift(newInvitation);
    this.saveClassInvitations(invitations);

    this.addActivityLog({
      action: `Teacher invited ${student.name} (@${student.username}) to join classroom ${params.className}`,
      user: currentUser?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'blue'
    });

    return {
      success: true,
      message: `Invitation successfully sent to ${student.name} (@${student.username})!`,
      invitation: newInvitation
    };
  }

  public respondToClassInvitation(
    invitationId: string,
    response: 'Accepted' | 'Declined'
  ): { success: boolean; message: string; invitation?: ClassInvitation } {
    const invitations = this.getClassInvitations();
    const invitation = invitations.find(i => i.id === invitationId);
    if (!invitation) {
      return { success: false, message: 'Invitation not found.' };
    }

    invitation.status = response;
    this.saveClassInvitations(invitations);

    const students = this.getStudents();
    const student = students.find(s => s.username.toLowerCase() === invitation.studentUsername.toLowerCase());

    if (response === 'Accepted') {
      if (student) {
        student.className = invitation.className;
        this.saveStudents(students);
      }

      // Update current user session if student is logged in
      const currentUser = this.getCurrentTeacher() || this.getCurrentUser();
      if (currentUser && currentUser.username.toLowerCase() === invitation.studentUsername.toLowerCase()) {
        currentUser.classId = invitation.className;
        this.saveCurrentUser(currentUser);
      }

      // Automatically enroll the newly confirmed student in all exams assigned to this classroom
      const allExams = this.getItem<Examination[]>(STORAGE_KEYS.EXAMS, SEED_EXAMINATIONS);
      let examsChanged = false;
      const targetClassLower = invitation.className.toLowerCase();
      allExams.forEach(ex => {
        const isExamAssignedToClass =
          (ex.className && ex.className.toLowerCase() === targetClassLower) ||
          (ex.assignedClassNames && ex.assignedClassNames.some(c => c.toLowerCase() === targetClassLower));

        if (isExamAssignedToClass && student) {
          const studentIdSet = new Set<string>(ex.assignedStudentIds || []);
          if (student.id) studentIdSet.add(student.id);
          if (student.studentId) studentIdSet.add(student.studentId);
          ex.assignedStudentIds = Array.from(studentIdSet);

          const totalInClass = students.filter(s => s.className.toLowerCase() === targetClassLower).length;
          ex.assignedStudentCount = Math.max(totalInClass, ex.assignedStudentIds.length);
          examsChanged = true;
        }
      });
      if (examsChanged) {
        this.saveExams(allExams);
      }

      this.addActivityLog({
        action: `${invitation.studentName || invitation.studentUsername} confirmed and joined classroom ${invitation.className} (enrolled in classroom exams)`,
        user: invitation.studentName || invitation.studentUsername,
        timestamp: 'Just now',
        color: 'teal'
      });

      return {
        success: true,
        message: `Welcome! You have confirmed the invitation and joined ${invitation.className}. You are now enrolled in all examinations assigned to this class.`,
        invitation
      };
    } else {
      this.addActivityLog({
        action: `${invitation.studentName || invitation.studentUsername} declined invitation for classroom ${invitation.className}`,
        user: invitation.studentName || invitation.studentUsername,
        timestamp: 'Just now',
        color: 'orange'
      });

      return {
        success: true,
        message: `You declined the invitation to join ${invitation.className}.`,
        invitation
      };
    }
  }

  // Assign exam to a specific classroom
  public assignExamToClass(examId: string, className: string): Examination | undefined {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return undefined;

    // Track assigned classrooms without losing existing assignments
    const existingClasses = (exam.assignedClassNames || []).filter(c => c && c !== 'Unassigned');
    const cleanClassName = className.trim();
    if (!existingClasses.some(c => c.toLowerCase() === cleanClassName.toLowerCase())) {
      existingClasses.push(cleanClassName);
    }
    exam.assignedClassNames = existingClasses;
    exam.className = existingClasses.join(', ');

    // Find all students who belong to any of these assigned classes
    const allStudents = this.getStudents();
    const lowerClasses = existingClasses.map(c => c.toLowerCase());
    const totalEnrolledStudents = allStudents.filter(
      s => s.className && lowerClasses.includes(s.className.toLowerCase())
    );

    const studentIdSet = new Set<string>();
    totalEnrolledStudents.forEach(s => {
      if (s.id) studentIdSet.add(s.id);
      if (s.studentId) studentIdSet.add(s.studentId);
    });
    exam.assignedStudentIds = Array.from(studentIdSet);
    exam.assignedStudentCount = totalEnrolledStudents.length;
    exam.updatedAt = new Date().toISOString();

    this.saveExams(exams);

    this.addActivityLog({
      action: `Assigned examination "${exam.title}" to classroom ${className} (Total enrolled: ${totalEnrolledStudents.length} across ${existingClasses.length} classes)`,
      user: this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'blue',
      examId: exam.id
    });

    return exam;
  }

  // Remove / unassign a specific classroom from an examination
  public removeClassFromExam(examId: string, className: string): { success: boolean; message: string; exam?: Examination } {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { success: false, message: 'Examination not found.' };

    const targetLower = className.trim().toLowerCase();
    const existingClasses = (exam.assignedClassNames || []).filter(c => c && c !== 'Unassigned');
    const updatedClasses = existingClasses.filter(c => c.toLowerCase() !== targetLower);

    exam.assignedClassNames = updatedClasses;
    exam.className = updatedClasses.length > 0 ? updatedClasses.join(', ') : 'Unassigned';

    // Recalculate enrolled students from remaining classes
    const allStudents = this.getStudents();
    const lowerRemaining = updatedClasses.map(c => c.toLowerCase());
    const remainingStudents = allStudents.filter(
      s => s.className && lowerRemaining.includes(s.className.toLowerCase())
    );

    const studentIdSet = new Set<string>();
    remainingStudents.forEach(s => {
      if (s.id) studentIdSet.add(s.id);
      if (s.studentId) studentIdSet.add(s.studentId);
    });

    exam.assignedStudentIds = Array.from(studentIdSet);
    exam.assignedStudentCount = remainingStudents.length;
    exam.updatedAt = new Date().toISOString();

    this.saveExams(exams);

    this.addActivityLog({
      action: `Removed classroom "${className}" from examination "${exam.title}" (Remaining classes: ${updatedClasses.length})`,
      user: this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'orange',
      examId: exam.id
    });

    return {
      success: true,
      message: `Removed "${className}" from "${exam.title}". Enrolled cohort updated.`,
      exam
    };
  }

  public cancelClassInvitation(invitationId: string): void {
    const invitations = this.getClassInvitations().filter(i => i.id !== invitationId);
    this.saveClassInvitations(invitations);
  }

  // Question Bank
  public getQuestionBank(): Question[] {
    return this.getItem<Question[]>(STORAGE_KEYS.QUESTION_BANK, SEED_QUESTION_BANK);
  }

  public saveQuestionBank(questions: Question[]): void {
    this.setItem(STORAGE_KEYS.QUESTION_BANK, questions);
  }

  public saveQuestion(question: Question): void {
    const questions = this.getQuestionBank();
    const idx = questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      questions[idx] = question;
    } else {
      questions.unshift(question);
    }
    this.saveQuestionBank(questions);
  }

  public deleteQuestion(id: string): void {
    const questions = this.getQuestionBank().filter(q => q.id !== id);
    this.saveQuestionBank(questions);
  }

  // Submissions
  public getSubmissions(): ExaminationSubmission[] {
    let list = this.getItem<ExaminationSubmission[]>(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    if (!list) list = [];
    
    // Filter out deleted legacy accounts
    list = list.filter(s => {
      const u = (s.studentUsername || '').toLowerCase();
      const n = (s.studentName || '').toLowerCase();
      return u !== 'abel.tesfaye' && !u.includes('abebe') && n !== 'abel tesfaye' && !n.includes('abebe');
    });

    // Auto-normalize and synchronize question grading with accurate scores
    const exams = this.getItem<Examination[]>(STORAGE_KEYS.EXAMS, []);
    let modified = false;

    list.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      if (exam && exam.questions && exam.questions.length > 0 && sub.answers && Object.keys(sub.answers).length > 0) {
        let score = 0;
        let maxMarks = 0;
        const grading: Record<string, { marksAwarded: number; maxMarks: number; status: 'Correct' | 'Incorrect'; studentAnswer?: string }> = {};

        exam.questions.forEach(q => {
          const qMarks = q.marks || 1;
          maxMarks += qMarks;
          const rawAns = sub.answers[q.id] as any;
          let choice = '';
          if (typeof rawAns === 'string') {
            choice = rawAns.trim();
          } else if (rawAns && typeof rawAns === 'object') {
            choice = String(rawAns.selectedOption ?? rawAns.answer ?? rawAns.id ?? '').trim();
          }
          if (choice.toLowerCase() === '[object object]') choice = '';

          const correctKey = (q.correctAnswer || '').trim();
          const isCorrect = Boolean(choice) && choice.toUpperCase() === correctKey.toUpperCase();

          if (isCorrect) {
            score += qMarks;
            grading[q.id] = { marksAwarded: qMarks, maxMarks: qMarks, status: 'Correct', studentAnswer: choice };
          } else {
            grading[q.id] = { marksAwarded: 0, maxMarks: qMarks, status: 'Incorrect', studentAnswer: choice };
          }
        });

        const maxScore = maxMarks || (exam.totalMarks || 100);
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        let grade = 'F';
        if (percentage >= 85) grade = 'A';
        else if (percentage >= 75) grade = 'B';
        else if (percentage >= 65) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        if (sub.score !== score || sub.maxScore !== maxScore || sub.percentage !== percentage || !sub.questionGrading) {
          sub.score = score;
          sub.maxScore = maxScore;
          sub.percentage = percentage;
          sub.grade = grade;
          sub.questionGrading = grading;
          sub.status = 'Graded';
          sub.resultsReleased = true;
          modified = true;
        }
      }
    });

    if (modified) {
      this.setItem(STORAGE_KEYS.SUBMISSIONS, list);
    }
    return list;
  }

  public saveSubmissions(submissions: ExaminationSubmission[]): void {
    this.setItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  }

  public saveSubmission(sub: ExaminationSubmission): void {
    const submissions = this.getSubmissions();
    const idx = submissions.findIndex(s => s.id === sub.id || (s.examId === sub.examId && s.studentId === sub.studentId));
    if (idx >= 0) {
      submissions[idx] = sub;
    } else {
      submissions.unshift(sub);
    }
    this.saveSubmissions(submissions);
    supabaseSync.syncSubmissionToCloud(sub);
  }

  // Grade for Everyone: Teacher grades and releases results for all (or class-scoped) submissions of an exam
  public gradeAllSubmissionsForExam(examId: string, targetClass?: string): { gradedCount: number; averageScore: number } {
    const submissions = this.getSubmissions();
    const exam = this.getExamById(examId);
    let gradedCount = 0;
    let totalScore = 0;

    submissions.forEach(sub => {
      if (sub.examId !== examId) return;
      if (targetClass && !isSameClass(sub.className, targetClass)) return;

      let score = 0;
      let maxScore = 0;
      const grading: ExaminationSubmission['questionGrading'] = {};

      const hasRecordedAnswers = sub.answers && Object.keys(sub.answers).length > 0;

      if (exam && exam.questions.length > 0) {
        exam.questions.forEach(q => {
          maxScore += q.marks;
          if (hasRecordedAnswers) {
            const rawAns = sub.answers[q.id] as any;
            let studentChoice = '';
            if (typeof rawAns === 'string') {
              studentChoice = rawAns.trim();
            } else if (rawAns && typeof rawAns === 'object') {
              studentChoice = String(rawAns.selectedOption ?? rawAns.answer ?? rawAns.id ?? '').trim();
            }
            if (studentChoice.toLowerCase() === '[object object]') studentChoice = '';

            if (studentChoice && q.correctAnswer && studentChoice.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
              score += q.marks;
              grading[q.id] = { marksAwarded: q.marks, maxMarks: q.marks, status: 'Correct', studentAnswer: studentChoice };
            } else {
              grading[q.id] = { marksAwarded: 0, maxMarks: q.marks, status: 'Incorrect', studentAnswer: studentChoice };
            }
          }
        });
      }

      // If no per-question answers were recorded, preserve their established score & percentage
      if (!hasRecordedAnswers) {
        if (typeof sub.score === 'number' && sub.score > 0) {
          score = sub.score;
          maxScore = sub.maxScore || (exam?.totalMarks || 100);
        } else {
          score = (sub.answeredCount || 5) * 2;
          maxScore = (sub.totalQuestions || 5) * 2;
        }
      }

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : (sub.percentage || 80);
      let grade = sub.grade || 'C';
      if (percentage >= 85) grade = 'A';
      else if (percentage >= 75) grade = 'B';
      else if (percentage >= 65) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';

      sub.score = score;
      sub.maxScore = maxScore || 100;
      sub.percentage = percentage;
      sub.grade = grade;
      sub.status = 'Graded';
      sub.resultsReleased = true;
      if (Object.keys(grading).length > 0) {
        sub.questionGrading = grading;
      }
      if (!sub.teacherFeedback) {
        sub.teacherFeedback = percentage >= 75 ? 'Well done! Great performance on this assessment.' : 'Keep practicing these units.';
      }

      gradedCount++;
      totalScore += percentage;
    });

    this.saveSubmissions(submissions);

    // Also mark exam results as released
    if (exam) {
      exam.resultsReleased = true;
      this.saveExam(exam);
    }

    const avg = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

    this.addActivityLog({
      action: `Teacher regraded examination results${targetClass ? ` for ${targetClass}` : ''} (${gradedCount} graded)`,
      user: this.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'teal',
      examId
    });

    return { gradedCount, averageScore: avg };
  }

  // Activity Logs
  public getActivityLogs(): ActivityLogItem[] {
    return this.getItem<ActivityLogItem[]>(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
  }

  public saveActivityLogs(logs: ActivityLogItem[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }

  public addActivityLog(item: Omit<ActivityLogItem, 'id'>): void {
    const logs = this.getActivityLogs();
    const newItem: ActivityLogItem = {
      ...item,
      id: `ACT-${Date.now()}`
    };
    logs.unshift(newItem);
    this.saveActivityLogs(logs.slice(0, 100));
  }

  private isBannedUser(user: User | null): boolean {
    if (!user) return false;
    const lowerUser = (user.username || '').toLowerCase();
    const lowerName = (user.name || '').toLowerCase();
    return (
      lowerUser === 'alemu.tadesse' ||
      lowerUser === 'abel.tesfaye' ||
      lowerUser.includes('abebe') ||
      lowerName === 'alemu tadesse' ||
      lowerName === 'abel tesfaye'
    );
  }

  public getCurrentTeacher(): User | null {
    const user = this.getItem<User | null>(STORAGE_KEYS.CURRENT_TEACHER, null);
    if (this.isBannedUser(user)) {
      this.saveCurrentTeacher(null);
      return null;
    }
    return user;
  }

  public saveCurrentTeacher(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_TEACHER, user);
    if (user) {
      // Security: Purge any student session to prevent role leakage
      this.setItem(STORAGE_KEYS.CURRENT_STUDENT, null);
      this.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'Teacher');
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }
  }

  public getCurrentStudent(): User | null {
    const user = this.getItem<User | null>(STORAGE_KEYS.CURRENT_STUDENT, null);
    if (this.isBannedUser(user)) {
      this.saveCurrentStudent(null);
      return null;
    }
    return user;
  }

  public saveCurrentStudent(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_STUDENT, user);
    if (user) {
      // Security: Purge any teacher session to prevent role leakage
      this.setItem(STORAGE_KEYS.CURRENT_TEACHER, null);
      this.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'Student');
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }
  }

  public getActiveRole(): UserRole {
    return this.getItem<UserRole>(STORAGE_KEYS.ACTIVE_ROLE, 'Teacher');
  }

  public setActiveRole(role: UserRole): void {
    this.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
  }

  // Auth User
  public getCurrentUser(roleHint?: UserRole): User | null {
    if (roleHint === 'Teacher') {
      return this.getCurrentTeacher();
    }
    if (roleHint === 'Student') {
      return this.getCurrentStudent();
    }
    const active = this.getActiveRole();
    if (active === 'Teacher') {
      return this.getCurrentTeacher();
    } else {
      return this.getCurrentStudent();
    }
  }

  public saveCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    if (user === null) {
      this.setItem(STORAGE_KEYS.CURRENT_TEACHER, null);
      this.setItem(STORAGE_KEYS.CURRENT_STUDENT, null);
    } else if (user.role === 'Teacher') {
      this.saveCurrentTeacher(user);
    } else if (user.role === 'Student') {
      this.saveCurrentStudent(user);
    }
  }

  public async syncFromCloud(): Promise<void> {
    try {
      const cloudUsers = await supabaseSync.fetchUsersFromCloud();
      if (cloudUsers && cloudUsers.length > 0) {
        const teachers = this.getTeachers();
        const students = this.getStudents();
        let changed = false;

        cloudUsers.forEach(cu => {
          if (cu.role === 'Teacher') {
            if (!teachers.some(t => t.id === cu.id || t.username.toLowerCase() === cu.username.toLowerCase())) {
              teachers.push({
                id: cu.id,
                username: cu.username,
                name: cu.name,
                role: 'Teacher',
                password: cu.password,
                email: cu.email,
                avatarText: cu.avatar_text || cu.name.slice(0, 2).toUpperCase()
              });
              changed = true;
            }
          } else {
            if (!students.some(s => s.id === cu.id || s.username.toLowerCase() === cu.username.toLowerCase())) {
              students.push({
                id: cu.id,
                studentId: cu.student_id || cu.id,
                username: cu.username,
                name: cu.name,
                password: cu.password,
                gradeLevel: cu.grade_level || 'Grade 10',
                section: cu.section || 'Section A',
                requestedClass: cu.requested_class || undefined,
                enrollmentStatus: cu.enrollment_status || 'Pending',
                className: cu.class_name || 'Unassigned',
                status: 'Active',
                connectionStatus: 'Connected',
                submissionStatus: 'Not submitted'
              });
              changed = true;
            }
          }
        });

        if (changed) {
          this.saveTeachers(teachers);
          this.saveStudents(students);
        }
      }
    } catch (e) {
      console.warn('[StorageService] syncFromCloud error:', e);
    }
  }

  // Student in-progress exam answers
  public getStudentExamAnswers(examId: string, studentId: string): Record<string, string> {
    const all = this.getItem<Record<string, Record<string, string>>>(STORAGE_KEYS.STUDENT_ANSWERS, {});
    const key = `${examId}_${studentId}`;
    return all[key] || {};
  }

  public saveStudentExamAnswers(examId: string, studentId: string, answers: Record<string, string>): void {
    const all = this.getItem<Record<string, Record<string, string>>>(STORAGE_KEYS.STUDENT_ANSWERS, {});
    const key = `${examId}_${studentId}`;
    all[key] = answers;
    this.setItem(STORAGE_KEYS.STUDENT_ANSWERS, all);
  }

  // Settings
  public getSettings(): Record<string, any> {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS, {
      schoolName: 'Example Secondary School',
      academicYear: '2026/2027',
      language: 'English',
      defaultDuration: '60 minutes',
      autoSubmit: true,
      requireApproval: true,
      strongPasswords: true,
      sessionTimeout: true,
      auditActivity: true,
      notifyOnSubmit: true,
      notifyDisconnected: true,
      examReminders: true,
      compactTables: false,
      reduceMotion: false,
      accentColor: 'Blue / Purple'
    });
  }

  public saveSettings(settings: Record<string, any>): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }
}

export const storageService = new StorageService();
storageService.initialize();
