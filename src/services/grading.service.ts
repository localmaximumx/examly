import { Examination, ExaminationSubmission } from '../types';
import { storageService } from './storage.service';

export function isSameClass(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanB = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanA === cleanB) return true;
  const stripA = cleanA.replace(/^grade/, '');
  const stripB = cleanB.replace(/^grade/, '');
  return stripA === stripB;
}

class GradingService {
  public autoGradeSubmission(exam: Examination, submission: ExaminationSubmission): ExaminationSubmission {
    let totalScore = 0;
    let maxScore = 0;
    const questionGrading: ExaminationSubmission['questionGrading'] = {};

    exam.questions.forEach(q => {
      maxScore += q.marks;
      const answer = submission.answers[q.id];
      const studentChoice = answer?.selectedOption;

      if (studentChoice && q.correctAnswer && studentChoice.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        totalScore += q.marks;
        questionGrading[q.id] = {
          marksAwarded: q.marks,
          maxMarks: q.marks,
          status: 'Correct'
        };
      } else {
        questionGrading[q.id] = {
          marksAwarded: 0,
          maxMarks: q.marks,
          status: 'Incorrect'
        };
      }
    });

    const finalMaxScore = maxScore > 0 ? maxScore : 10;
    const percentage = Math.round((totalScore / finalMaxScore) * 100);

    return {
      ...submission,
      score: totalScore,
      maxScore: finalMaxScore,
      percentage,
      grade: this.calculateGrade(percentage),
      status: 'Graded',
      questionGrading
    };
  }

  public calculateGrade(percentage: number): string {
    if (percentage >= 85) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 65) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  // Teacher clicks "Grade for Everyone" (optionally scoped to a specific class)
  public gradeAllForExam(examId: string, targetClass?: string): { gradedCount: number; averageScore: number } {
    return storageService.gradeAllSubmissionsForExam(examId, targetClass);
  }

  public saveManualGrading(params: {
    submissionId: string;
    questionMarks: Record<string, number>;
    teacherFeedback: string;
  }): boolean {
    const submissions = storageService.getSubmissions();
    const sub = submissions.find(s => s.id === params.submissionId);
    if (!sub) return false;
    sub.teacherFeedback = params.teacherFeedback;
    const totalAwarded = Object.values(params.questionMarks).reduce((a, b) => a + b, 0);
    sub.score = totalAwarded;
    sub.percentage = Math.round((totalAwarded / (sub.maxScore || 10)) * 100);
    sub.grade = this.calculateGrade(sub.percentage);
    sub.status = 'Graded';
    storageService.saveSubmissions(submissions);
    return true;
  }

  public getResultsStats(examId?: string) {
    const all = storageService.getSubmissions();
    const filtered = examId ? all.filter(s => s.examId === examId) : all;
    const graded = filtered.filter(s => s.status === 'Graded' && typeof s.percentage === 'number');

    if (graded.length === 0) {
      return {
        totalGraded: 0,
        awaitingGrading: filtered.length,
        averageScore: '0%',
        highestScore: '0%',
        lowestScore: '0%',
        passRate: '0%',
        distribution: [
          { grade: 'A', count: 0, percentage: 0 },
          { grade: 'B', count: 0, percentage: 0 },
          { grade: 'C', count: 0, percentage: 0 },
          { grade: 'D', count: 0, percentage: 0 },
          { grade: 'F', count: 0, percentage: 0 }
        ]
      };
    }

    const scores = graded.map(s => s.percentage || 0);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = scores.filter(s => s >= 50).length;
    const passRate = ((passed / scores.length) * 100).toFixed(1);

    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    graded.forEach(s => {
      const g = s.grade || 'C';
      if (counts[g] !== undefined) counts[g]++;
    });

    const distribution = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
      grade,
      count: counts[grade],
      percentage: Math.round((counts[grade] / graded.length) * 100)
    }));

    return {
      totalGraded: graded.length,
      awaitingGrading: filtered.length - graded.length,
      averageScore: `${avg}%`,
      highestScore: `${highest}%`,
      lowestScore: `${lowest}%`,
      passRate: `${passRate}%`,
      distribution
    };
  }

  public exportResultsCSV(examId?: string, targetClass?: string): string {
    const allSubmissions = storageService.getSubmissions();

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Student ID',
      'Student Name',
      'Username',
      'Class',
      'Examination',
      'Score',
      'Max Score',
      'Percentage',
      'Grade',
      'Status',
      'Results Released',
      'Submitted At'
    ];

    // Filter ONLY submissions that took this examination
    let examSubs = examId ? allSubmissions.filter(s => s.examId === examId) : allSubmissions;

    // If targetClass is specified, restrict exclusively to students in that class who took the exam
    if (targetClass) {
      examSubs = examSubs.filter(s => isSameClass(s.className, targetClass));
    }

    const rows = examSubs.map(sub => [
      escapeCSV(sub.studentId),
      escapeCSV(sub.studentName),
      escapeCSV(sub.studentUsername),
      escapeCSV(sub.className),
      escapeCSV(sub.examTitle),
      escapeCSV(sub.score !== undefined ? sub.score : ''),
      escapeCSV(sub.maxScore || 100),
      escapeCSV(sub.percentage !== undefined ? `${sub.percentage}%` : ''),
      escapeCSV(sub.grade || 'Pending'),
      escapeCSV(sub.status),
      escapeCSV(sub.resultsReleased ? 'Yes' : 'No'),
      escapeCSV(sub.submittedAt || '—')
    ]);

    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const gradingService = new GradingService();
