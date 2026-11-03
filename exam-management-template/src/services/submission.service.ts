import { ExaminationSubmission, StudentAnswer } from '../types';
import { storageService } from './storage.service';

class SubmissionService {
  public getAllSubmissions(): ExaminationSubmission[] {
    return storageService.getSubmissions();
  }

  public getSubmissionsForExam(examId: string): ExaminationSubmission[] {
    return this.getAllSubmissions().filter(s => s.examId === examId);
  }

  public getSubmissionsForStudent(studentIdOrUsername: string): ExaminationSubmission[] {
    return this.getAllSubmissions().filter(
      s => s.studentId === studentIdOrUsername || s.studentUsername === studentIdOrUsername
    );
  }

  public getSubmission(examId: string, studentId: string): ExaminationSubmission | undefined {
    return this.getAllSubmissions().find(
      s => s.examId === examId && (s.studentId === studentId || s.studentUsername === studentId)
    );
  }

  public hasSubmitted(examId: string, studentId: string): boolean {
    return !!this.getSubmission(examId, studentId);
  }

  public submitExam(params: {
    examId: string;
    studentId: string;
    studentName: string;
    studentUsername: string;
    className: string;
    answers: Record<string, string>; // questionId -> selected choice 'A', 'B', etc.
  }): { success: boolean; submission?: ExaminationSubmission; message?: string } {
    const exam = storageService.getExamById(params.examId);
    if (!exam) return { success: false, message: 'Examination not found.' };

    if (this.hasSubmitted(params.examId, params.studentId)) {
      return { success: false, message: 'This examination has already been submitted.' };
    }

    const totalQuestions = exam.questions.length > 0 ? exam.questions.length : 4;
    const answeredKeys = Object.keys(params.answers).filter(k => params.answers[k] && params.answers[k].trim() !== '');
    const answeredCount = answeredKeys.length;
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);

    const submissionId = `EXM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedAnswers: Record<string, StudentAnswer> = {};
    exam.questions.forEach(q => {
      formattedAnswers[q.id] = {
        questionId: q.id,
        questionNumber: q.questionNumber,
        selectedOption: params.answers[q.id]
      };
    });

    // Submissions start with status 'Received' and resultsReleased = false!
    // Result is held UNTIL teacher decides to grade and release for everyone!
    const newSubmission: ExaminationSubmission = {
      id: submissionId,
      examId: exam.id,
      examTitle: exam.title,
      examCode: exam.code,
      studentId: params.studentId,
      studentName: params.studentName,
      studentUsername: params.studentUsername,
      className: params.className,
      submittedAt:
        new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
        ' · ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      answers: formattedAnswers,
      totalQuestions,
      answeredCount,
      unansweredCount,
      status: 'Received',
      resultsReleased: false
    };

    storageService.saveSubmission(newSubmission);

    // Update student's submission status in students list
    const students = storageService.getStudents();
    const student = students.find(
      s => s.studentId === params.studentId || s.id === params.studentId || s.username === params.studentUsername
    );
    if (student) {
      student.submissionStatus = 'Submitted';
      storageService.saveStudent(student);
    }

    // Add activity log
    storageService.addActivityLog({
      action: `${params.studentName} submitted ${exam.title} (${answeredCount}/${totalQuestions} answered)`,
      user: params.studentName,
      timestamp: 'Just now',
      color: 'teal',
      examId: exam.id
    });

    return { success: true, submission: newSubmission };
  }
}

export const submissionService = new SubmissionService();
