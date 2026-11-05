import { Examination, ExamStatus } from '../types';
import { storageService } from './storage.service';
import { formatDisplayDate } from '../utils/date.utils';
import { isSameClass } from './grading.service';

class ExamService {
  public getAllExams(): Examination[] {
    return storageService.getExams();
  }

  public getExamById(id: string): Examination | undefined {
    return storageService.getExamById(id);
  }

  public getExamsForTeacher(teacherUsername?: string): Examination[] {
    const all = this.getAllExams();
    const effectiveUsername = teacherUsername || storageService.getCurrentTeacher()?.username || storageService.getCurrentUser()?.username;
    if (!effectiveUsername) return [];
    const target = effectiveUsername.trim().toLowerCase();
    return all.filter(
      e => (e.teacherUsername || '').trim().toLowerCase() === target
    );
  }

  private extractGradeLevel(className?: string): number | null {
    if (!className) return null;
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  public getExamsForStudent(studentIdOrUsername: string): Examination[] {
    const exams = this.getAllExams();
    const student = storageService.getStudents().find(
      s => s.id === studentIdOrUsername || s.username === studentIdOrUsername || s.studentId === studentIdOrUsername
    );
    if (!student || !student.className || student.className === 'Unassigned') {
      return [];
    }

    const studentClass = student.className.trim().toLowerCase();

    return exams.filter(e => {
      // Unassigned examinations must NEVER appear on student home page
      const assigned = new Set<string>();
      if (e.assignedClassNames && Array.isArray(e.assignedClassNames)) {
        e.assignedClassNames.forEach(c => {
          const t = c.trim().toLowerCase();
          if (t && t !== 'unassigned') assigned.add(t);
        });
      }
      if (e.className && e.className !== 'Unassigned') {
        e.className.split(',').forEach(c => {
          const t = c.trim().toLowerCase();
          if (t && t !== 'unassigned') assigned.add(t);
        });
      }

      if (assigned.size === 0) {
        return false;
      }

      // Must strictly match student's classroom
      return Array.from(assigned).some(c => c === studentClass || isSameClass(c, studentClass));
    });
  }

  public filterExams(query: string, statusTab: string = 'All', teacherUsername?: string): Examination[] {
    const exams = teacherUsername ? this.getExamsForTeacher(teacherUsername) : this.getAllExams();
    const cleanQuery = query.toLowerCase().trim();
    return exams.filter(e => {
      const shortClass = (e.className || '')
        .split(',')
        .map(c => c.trim().replace(/^Grade[- ]*(\d+)\s*([A-Za-z]*)$/i, 'G$1$2'))
        .join(', ');

      const matchesQuery =
        !cleanQuery ||
        e.title.toLowerCase().includes(cleanQuery) ||
        e.code.toLowerCase().includes(cleanQuery) ||
        e.className.toLowerCase().includes(cleanQuery) ||
        shortClass.toLowerCase().includes(cleanQuery) ||
        e.subject.toLowerCase().includes(cleanQuery);

      const matchesStatus = statusTab === 'All' || e.status === statusTab;
      return matchesQuery && matchesStatus;
    });
  }

  public createExam(examData: Partial<Examination>): Examination {
    const durationMin = examData.durationMinutes || (examData.duration ? parseInt(examData.duration, 10) : 60);
    const enrolledInClass = storageService.getStudents().filter(s => s.className === (examData.className || 'Grade 10A')).length;
    const currentTeacher = storageService.getCurrentTeacher() || storageService.getCurrentUser();
    const teacherUsername = examData.teacherUsername || currentTeacher?.username || '';
    const teacherName = examData.teacherName || currentTeacher?.name || 'Teacher';

    const newExam: Examination = {
      id: examData.id || `EXM-${Date.now().toString().slice(-4)}`,
      code: examData.code || `EX-${Math.floor(100 + Math.random() * 900)}`,
      title: examData.title || 'Untitled Examination',
      description: examData.description || '',
      subject: examData.subject || 'General',
      classId: examData.classId || 'CLS-10A',
      className: examData.className || 'Grade 10A',
      assignedClassNames: examData.assignedClassNames || (examData.className ? [examData.className] : ['Grade 10A']),
      teacherUsername,
      teacherName,
      assignedStudentCount: examData.assignedStudentCount ?? (examData.assignedStudentIds?.length || enrolledInClass),
      assignedStudentIds: examData.assignedStudentIds || [],
      examDate: formatDisplayDate(examData.examDate || new Date()),
      startTime: examData.startTime || '09:00 AM',
      duration: `${durationMin} min`,
      durationMinutes: durationMin,
      totalMarks: examData.totalMarks || (examData.questions?.reduce((sum, q) => sum + q.marks, 0) || 10),
      instructions: examData.instructions || 'Answer all questions carefully before submitting.',
      academicTerm: examData.academicTerm || 'First semester',
      status: examData.status || 'Ready',
      questions: examData.questions || [],
      resultsReleased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveExam(newExam);
    storageService.addActivityLog({
      action: `Created examination "${newExam.title}"`,
      user: storageService.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'blue',
      examId: newExam.id
    });
    return newExam;
  }

  public startOfficialExam(id: string): { success: boolean; message?: string; exam?: Examination } {
    const exam = storageService.startExamOfficial(id);
    if (!exam) {
      return { success: false, message: 'Examination not found.' };
    }
    return { success: true, message: 'Examination session started.', exam };
  }

  public toggleExamPause(examId: string): { success: boolean; isPaused: boolean; exam?: Examination } {
    return storageService.toggleExamPause(examId);
  }

  public removeClassFromExam(examId: string, className: string): { success: boolean; message: string; exam?: Examination } {
    return storageService.removeClassFromExam(examId, className);
  }

  public extendExamTime(id: string, additionalMinutes: number): { success: boolean; message: string; exam?: Examination } {
    const exam = storageService.extendExamTime(id, additionalMinutes);
    if (!exam) {
      return { success: false, message: 'Examination not found.' };
    }
    return {
      success: true,
      message: `Added +${additionalMinutes} minutes to "${exam.title}". New duration: ${exam.duration}.`,
      exam
    };
  }

  public updateExam(exam: Examination): Examination {
    const updated = {
      ...exam,
      updatedAt: new Date().toISOString()
    };
    storageService.saveExam(updated);
    storageService.addActivityLog({
      action: `Updated examination "${updated.title}"`,
      user: storageService.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'purple',
      examId: updated.id
    });
    return updated;
  }

  public deleteExam(id: string): void {
    const exam = this.getExamById(id);
    if (exam) {
      storageService.deleteExam(id);
      storageService.addActivityLog({
        action: `Deleted examination "${exam.title}"`,
        user: storageService.getCurrentUser()?.name || 'Teacher',
        timestamp: 'Just now',
        color: 'orange'
      });
    }
  }

  public updateStatus(id: string, newStatus: ExamStatus): { success: boolean; message: string } {
    const exam = this.getExamById(id);
    if (!exam) return { success: false, message: 'Examination not found' };

    if (newStatus === 'Active') {
      storageService.startExamOfficial(id);
      return { success: true, message: `"${exam.title}" is now ACTIVE. Official synchronized timer started.` };
    }

    exam.status = newStatus;
    exam.updatedAt = new Date().toISOString();
    storageService.saveExam(exam);

    storageService.addActivityLog({
      action: `Changed status of "${exam.title}" to ${newStatus}`,
      user: storageService.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: newStatus === 'Completed' ? 'purple' : 'blue',
      examId: exam.id
    });

    return { success: true, message: `Examination status updated to ${newStatus}` };
  }

  // Verification if a student can enter the exam
  public canStudentEnterExam(examId: string, studentId: string): { allowed: boolean; reason?: string; status?: string } {
    const exam = this.getExamById(examId);
    if (!exam) return { allowed: false, reason: 'Examination not found' };

    // 1. Check if student already submitted
    const submissions = storageService.getSubmissions();
    const hasSubmitted = submissions.some(s => s.examId === examId && (s.studentId === studentId || s.studentUsername === studentId));
    if (hasSubmitted) {
      return { allowed: false, reason: 'You have already submitted this examination.', status: 'Submitted' };
    }

    // 2. Check if student belongs to the classes assigned by the teacher
    const student = storageService.getStudents().find(s => s.id === studentId || s.studentId === studentId || s.username === studentId);
    if (!student || !student.className || student.className === 'Unassigned') {
      return { allowed: false, reason: 'You are not enrolled in any classroom authorized for this examination.', status: 'NotEnrolled' };
    }

    const assigned = new Set<string>();
    if (exam.assignedClassNames && Array.isArray(exam.assignedClassNames)) {
      exam.assignedClassNames.forEach(c => {
        const t = c.trim().toLowerCase();
        if (t && t !== 'unassigned') assigned.add(t);
      });
    }
    if (exam.className && exam.className !== 'Unassigned') {
      exam.className.split(',').forEach(c => {
        const t = c.trim().toLowerCase();
        if (t && t !== 'unassigned') assigned.add(t);
      });
    }

    if (assigned.size === 0) {
      return { allowed: false, reason: 'This examination is currently unassigned.', status: 'Unassigned' };
    }

    const studentClass = student.className.trim().toLowerCase();
    const isEnrolled = Array.from(assigned).some(c => c === studentClass || isSameClass(c, studentClass));

    if (!isEnrolled) {
      return { allowed: false, reason: 'You are no longer enrolled in the classroom authorized for this examination.', status: 'NotEnrolled' };
    }

    // 3. Check if exam is officially started by the teacher
    if (exam.status !== 'Active') {
      return {
        allowed: false,
        reason: 'The teacher has not started this examination yet. Please wait for the official start.',
        status: 'WaitingForStart'
      };
    }

    return { allowed: true };
  }

  public getDashboardStats(teacherUsername?: string) {
    const user = teacherUsername || storageService.getCurrentTeacher()?.username || storageService.getCurrentUser()?.username;
    const exams = user ? this.getExamsForTeacher(user) : [];
    const students = storageService.getStudents();
    const allSubmissions = storageService.getSubmissions();
    const examIds = new Set(exams.map(e => e.id));
    const submissions = allSubmissions.filter(s => examIds.has(s.examId));

    const totalExams = exams.length;
    const activeExams = exams.filter(e => e.status === 'Active').length;
    const upcomingExams = exams.filter(e => e.status === 'Ready').length;
    const completedExams = exams.filter(e => e.status === 'Completed').length;

    const teacherClassNames = new Set<string>();
    exams.forEach(e => {
      (e.assignedClassNames || []).forEach(c => {
        if (c && c !== 'Unassigned') teacherClassNames.add(c.trim().toLowerCase());
      });
      if (e.className && e.className !== 'Unassigned') {
        e.className.split(',').forEach(c => {
          const t = c.trim().toLowerCase();
          if (t && t !== 'unassigned') teacherClassNames.add(t);
        });
      }
    });

    const enrolledStudents = teacherClassNames.size > 0
      ? students.filter(s => s.className && teacherClassNames.has(s.className.trim().toLowerCase()))
      : [];
    const totalStudents = enrolledStudents.length;

    const graded = submissions.filter(s => s.status === 'Graded' && typeof s.percentage === 'number');
    const avgScore =
      graded.length > 0
        ? (graded.reduce((sum, s) => sum + (s.percentage || 0), 0) / graded.length).toFixed(1)
        : '—';

    return {
      totalExams,
      activeExams,
      upcomingExams,
      completedExams,
      totalStudents,
      avgScore: avgScore !== '—' ? `${avgScore}%` : '—',
      gradedCount: graded.length
    };
  }

  public getExamStudentInfo(exam: Examination) {
    const students = storageService.getStudents();
    const submissions = storageService.getSubmissions().filter(s => s.examId === exam.id);
    const joinRequests = storageService.getJoinRequests(exam.id);

    const assignedClasses = (exam.assignedClassNames || []).filter(c => c && c !== 'Unassigned');
    const assignedLower = assignedClasses.map(c => c.toLowerCase());
    const enrolledInClass = assignedClasses.length > 0
      ? students.filter(s => s.className && assignedLower.includes(s.className.toLowerCase()))
      : (exam.className && exam.className !== 'Unassigned'
        ? students.filter(s => s.className && s.className.toLowerCase() === exam.className.toLowerCase())
        : []);
    const enrolledCount = exam.className && exam.className !== 'Unassigned'
      ? (exam.assignedStudentCount && exam.assignedStudentCount > 0 ? exam.assignedStudentCount : enrolledInClass.length)
      : 0;

    const submittedCount = submissions.length;
    const inRoomCount = joinRequests.filter(r => r.status === 'Approved').length;
    const activeInSession = Math.max(0, enrolledCount - submittedCount);

    if (exam.status === 'Completed') {
      return {
        count: submittedCount > 0 ? submittedCount : enrolledCount,
        label: `${submittedCount} completed submissions`,
        subtext: 'completed submissions',
        enrolledCount,
        submittedCount,
        inRoomCount,
        activeInSession: 0
      };
    }

    if (exam.status === 'Active') {
      return {
        count: activeInSession,
        label: `${activeInSession} active in session`,
        subtext: 'active in session',
        enrolledCount,
        submittedCount,
        inRoomCount,
        activeInSession
      };
    }

    const isUnassigned = !exam.className || exam.className === 'Unassigned' || enrolledCount === 0;

    return {
      count: enrolledCount,
      label: isUnassigned ? 'Unassigned cohort' : `${enrolledCount} enrolled students`,
      subtext: isUnassigned ? 'unassigned' : 'enrolled students',
      enrolledCount,
      submittedCount,
      inRoomCount,
      activeInSession: 0
    };
  }

  public getTeacherPerformanceOverview(teacherUsername?: string): Array<{ label: string; percentage: number; tooltip: string }> {
    const exams = this.getExamsForTeacher(teacherUsername);
    if (exams.length === 0) return [];

    const allSubmissions = storageService.getSubmissions();
    const bars: Array<{ label: string; percentage: number; tooltip: string }> = [];

    exams.forEach(exam => {
      const subs = allSubmissions.filter(s => s.examId === exam.id && s.status === 'Graded' && typeof s.percentage === 'number');
      let pct = 0;
      if (subs.length > 0) {
        pct = Math.round(subs.reduce((acc, s) => acc + (s.percentage || 0), 0) / subs.length);
      } else {
        pct = exam.status === 'Completed' ? 84 : 76;
      }
      bars.push({
        label: exam.code || exam.title.slice(0, 7),
        percentage: pct,
        tooltip: `${exam.title}: ${pct}% avg (${subs.length} graded)`
      });
    });

    return bars;
  }
}

export const examService = new ExamService();
