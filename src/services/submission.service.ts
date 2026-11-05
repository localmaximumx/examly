import { ExaminationSubmission, StudentAnswer } from '../types';
import { storageService } from './storage.service';
import { supabaseSync } from '../lib/supabaseSync';

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
    let score = 0;
    let maxMarks = 0;
    const questionGrading: Record<string, { marksAwarded: number; maxMarks: number; status: 'Correct' | 'Incorrect'; studentAnswer?: string }> = {};

    exam.questions.forEach(q => {
      const qMarks = q.marks || 1;
      maxMarks += qMarks;
      const rawChoice = params.answers[q.id];
      const studentChoice = typeof rawChoice === 'string' ? rawChoice.trim().toUpperCase() : '';
      const correctChoice = (q.correctAnswer || '').trim().toUpperCase();
      const isCorrect = Boolean(studentChoice) && studentChoice === correctChoice;

      formattedAnswers[q.id] = {
        questionId: q.id,
        questionNumber: q.questionNumber,
        selectedOption: studentChoice
      };

      if (isCorrect) {
        score += qMarks;
        questionGrading[q.id] = { marksAwarded: qMarks, maxMarks: qMarks, status: 'Correct', studentAnswer: studentChoice };
      } else {
        questionGrading[q.id] = { marksAwarded: 0, maxMarks: qMarks, status: 'Incorrect', studentAnswer: studentChoice || '' };
      }
    });

    const maxScore = maxMarks || (exam.totalMarks || 100);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    let grade = 'F';
    if (percentage >= 85) grade = 'A';
    else if (percentage >= 75) grade = 'B';
    else if (percentage >= 65) grade = 'C';
    else if (percentage >= 50) grade = 'D';

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
      score,
      maxScore,
      percentage,
      grade,
      questionGrading,
      status: 'Graded',
      resultsReleased: true,
      teacherFeedback: percentage >= 75 ? 'Well done! Great performance on this assessment.' : 'Keep practicing these units.'
    };

    storageService.saveSubmission(newSubmission);
    supabaseSync.syncSubmissionToCloud(newSubmission);

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
