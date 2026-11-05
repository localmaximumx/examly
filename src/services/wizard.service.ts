import { Examination, Question } from '../types';
import { storageService } from './storage.service';
import { formatDisplayDate } from '../utils/date.utils';

const WIZARD_DRAFT_KEY = 'examly_wizard_draft';

export interface WizardDraft {
  id?: string;
  title: string;
  subject: string;
  classId: string;
  className: string;
  examDate: string;
  startTime: string;
  academicTerm: string;
  instructions: string;
  durationMinutes: number;
  maxMarks: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReview: boolean;
  autoSubmit: boolean;
  releaseResultsAfterApproval: boolean;
  lateGracePeriod: string;
  questions: Question[];
}

const DEFAULT_DRAFT: WizardDraft = {
  title: '',
  subject: 'Mathematics',
  classId: '',
  className: 'Unassigned',
  examDate: new Date().toISOString().split('T')[0],
  startTime: '09:00 AM',
  academicTerm: 'First semester',
  instructions: 'Read each question carefully. Answer all required questions before submitting. Your answers are saved as you work.',
  durationMinutes: 60,
  maxMarks: 10,
  shuffleQuestions: true,
  shuffleOptions: true,
  allowReview: true,
  autoSubmit: true,
  releaseResultsAfterApproval: true,
  lateGracePeriod: '5 minutes',
  questions: []
};

class WizardService {
  public getDraft(): WizardDraft {
    try {
      const data = localStorage.getItem(WIZARD_DRAFT_KEY);
      if (!data) return DEFAULT_DRAFT;
      return JSON.parse(data);
    } catch {
      return DEFAULT_DRAFT;
    }
  }

  public saveDraft(draft: Partial<WizardDraft>): WizardDraft {
    const current = this.getDraft();
    const updated = { ...current, ...draft };
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(updated));
    return updated;
  }

  public resetDraft(): void {
    localStorage.removeItem(WIZARD_DRAFT_KEY);
  }

  public loadExamToDraft(exam: Examination): WizardDraft {
    const draft: WizardDraft = {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      classId: exam.classId || 'CLS-10A',
      className: exam.className,
      examDate: exam.examDate,
      startTime: exam.startTime || '09:00 AM',
      academicTerm: exam.academicTerm || 'First semester',
      instructions: exam.instructions,
      durationMinutes: exam.durationMinutes || parseInt(exam.duration, 10) || 60,
      maxMarks: exam.totalMarks || 100,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowReview: true,
      autoSubmit: true,
      releaseResultsAfterApproval: true,
      lateGracePeriod: '5 minutes',
      questions: exam.questions ? JSON.parse(JSON.stringify(exam.questions)) : []
    };
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draft));
    return draft;
  }

  public publishDraft(): Examination {
    const draft = this.getDraft();
    const currentUser = storageService.getCurrentUser();
    const existing = draft.id ? storageService.getExams().find(e => e.id === draft.id) : undefined;
    const newExam: Examination = {
      id: draft.id || `EXM-${Date.now().toString().slice(-4)}`,
      code: existing?.code || `EX-${Math.floor(100 + Math.random() * 900)}`,
      title: draft.title,
      description: draft.className && draft.className !== 'Unassigned'
        ? `${draft.subject} examination for ${draft.className}.`
        : `${draft.subject} examination (Unassigned).`,
      subject: draft.subject,
      classId: draft.classId || '',
      className: draft.className || 'Unassigned',
      assignedClassNames: draft.className && draft.className !== 'Unassigned' ? [draft.className] : [],
      teacherUsername: existing?.teacherUsername || currentUser?.username || '',
      teacherName: existing?.teacherName || currentUser?.name || 'Teacher',
      assignedStudentCount: draft.className && draft.className !== 'Unassigned'
        ? storageService.getStudents().filter(s => s.className.toLowerCase() === draft.className.toLowerCase()).length
        : 0,
      examDate: formatDisplayDate(draft.examDate),
      startTime: draft.startTime,
      duration: `${draft.durationMinutes} min`,
      durationMinutes: draft.durationMinutes,
      totalMarks: draft.questions.reduce((sum, q) => sum + q.marks, 0) || draft.maxMarks,
      instructions: draft.instructions,
      academicTerm: draft.academicTerm,
      status: existing?.status || 'Ready',
      questions: draft.questions,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveExam(newExam);
    storageService.addActivityLog({
      action: existing ? `Updated examination "${newExam.title}"` : `Published examination "${newExam.title}"`,
      user: storageService.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'blue',
      examId: newExam.id
    });
    this.resetDraft();
    return newExam;
  }
}

export const wizardService = new WizardService();
