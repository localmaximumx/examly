// ==========================================
// Examly Core Domain Models & Types
// ==========================================

export type UserRole = 'Teacher' | 'Student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatarText: string;
  email?: string;
  studentId?: string; // STU-1001 for students
  classId?: string;   // Grade 10A for students
  className?: string; // e.g. Grade 10A
  gradeLevel?: string; // e.g. Grade 10
  section?: string;    // e.g. Section B
  requestedClass?: string; // e.g. Grade 12A
  enrollmentStatus?: 'Pending' | 'Enrolled' | 'Unassigned';
  password?: string;
}

export type Screen =
  | 'Teacher login'
  | 'Teacher dashboard'
  | 'Examination list'
  | 'Create exam – general information'
  | 'Create exam – questions'
  | 'Create exam – settings'
  | 'Exam preview'
  | 'Exam details'
  | 'Start examination confirmation'
  | 'Live monitoring'
  | 'Results dashboard'
  | 'Individual result & grading'
  | 'Question bank'
  | 'Students & classes'
  | 'Class detail'
  | 'Reports'
  | 'Settings'
  | 'Activity log'
  | 'Student login'
  | 'Student register'
  | 'Student home'
  | 'Exam instructions'
  | 'Main examination'
  | 'Connection interruption'
  | 'Submission confirmation'
  | 'Submission receipt'
  | 'Student examination history'
  | 'Student result view';

export type ExamStatus = 'Ready' | 'Active' | 'Completed';

// Only Multiple Choice and True/False questions as requested
export type QuestionType = 'Multiple choice' | 'True/false';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  type: QuestionType;
  marks: number;
  options?: QuestionOption[];
  correctAnswer?: string; // 'A', 'B', 'True', 'False'
  explanation?: string;
  imageUrl?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamSettings {
  durationMinutes: number;
  maxMarks: number;
  startDateTime: string;
  lateJoiningGracePeriod: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReview: boolean;
  autoSubmitOnExpiry: boolean;
  releaseResultsAfterApproval: boolean;
  negativeMarking: boolean;
}

export interface Examination {
  id: string;
  code: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  className: string;
  assignedClassNames?: string[];
  teacherId?: string;
  teacherUsername?: string;
  teacherName?: string;
  assignedStudentCount: number;
  assignedStudentIds?: string[];
  examDate: string;
  startTime: string;
  duration: string; // e.g. "90 min"
  durationMinutes?: number; // numeric minutes for unified timer
  startedAt?: number; // timestamp ms when teacher clicked start
  endTime?: number;   // timestamp ms when exam officially concludes
  isPaused?: boolean;
  pausedRemainingSeconds?: number;
  totalMarks: number;
  instructions: string;
  academicTerm: string;
  status: ExamStatus;
  questions: Question[];
  resultsReleased?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU-1001
  name: string;
  username: string;
  password?: string;
  gradeLevel?: string; // Primary grade level set on registration (e.g. "Grade 10")
  section?: string;    // Section (e.g. "B" or "Section B")
  requestedClass?: string; // Class student requested on signup (e.g. "Grade 12A")
  enrollmentStatus?: 'Pending' | 'Enrolled' | 'Unassigned';
  className: string;   // Current enrolled class (e.g. "Grade 10B" or "Unassigned")
  classId?: string;
  status: 'Active' | 'Inactive';
  connectionStatus: 'Connected' | 'Disconnected';
  submissionStatus: 'Submitted' | 'Not submitted';
}

export interface ClassGroup {
  id: string;
  name: string;
  academicYear: string;
  studentCount: number;
  gradeLevel?: number; // e.g. 10
  teacherUsername?: string;
  studentUsernames?: string[];
}

export interface ClassInvitation {
  id: string;
  classId: string;
  className: string;
  teacherName: string;
  teacherUsername: string;
  studentUsername: string;
  studentName?: string;
  studentId?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
}

export interface ExamJoinRequest {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  className: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface StudentAnswer {
  questionId: string;
  questionNumber: number;
  selectedOption?: string; // 'A', 'B', 'C', 'D', 'True', 'False'
  isMarkedForReview?: boolean;
}

export interface ExaminationSubmission {
  id: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  className: string;
  submittedAt: string;
  answers: Record<string, StudentAnswer>; // questionId -> answer
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  status: 'Received' | 'Graded' | 'Pending review';
  score?: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  resultsReleased?: boolean;
  teacherFeedback?: string;
  questionGrading?: Record<string, {
    marksAwarded: number;
    maxMarks: number;
    status: 'Correct' | 'Incorrect';
    feedback?: string;
    studentAnswer?: string;
  }>;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  color: 'blue' | 'teal' | 'purple' | 'orange';
  examId?: string;
}
