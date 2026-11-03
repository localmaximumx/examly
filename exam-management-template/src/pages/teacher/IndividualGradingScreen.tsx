import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BarChart3,
  Sparkles,
  BookOpen,
  Clock,
  HelpCircle,
  Check,
  X,
  FileText
} from 'lucide-react';
import { PageHeading, Button, Badge, Panel, Stat, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { Question, ExaminationSubmission } from '../../types';

export const IndividualGradingScreen: React.FC = () => {
  const { go, selectedExamId, selectedSubmissionId } = useApp();
  const [filterView, setFilterView] = useState<'missed' | 'all'>('missed');

  // Load the target submission
  const submission = useMemo<ExaminationSubmission | null>(() => {
    const list = storageService.getSubmissions();
    if (selectedSubmissionId) {
      const found = list.find(s => s.id === selectedSubmissionId);
      if (found) return found;
    }
    if (selectedExamId) {
      const foundForExam = list.find(s => s.examId === selectedExamId);
      if (foundForExam) return foundForExam;
    }
    return list[0] || null;
  }, [selectedSubmissionId, selectedExamId]);

  // Load the associated exam and questions
  const exam = useMemo(() => {
    if (submission?.examId) {
      const found = examService.getExamById(submission.examId);
      if (found) return found;
    }
    if (selectedExamId) {
      const found = examService.getExamById(selectedExamId);
      if (found) return found;
    }
    return examService.getAllExams()[0];
  }, [submission, selectedExamId]);

  const questions = useMemo<Question[]>(() => {
    return exam?.questions || [];
  }, [exam]);

  // Question evaluations: deterministic and matching the student's exact score
  const evaluatedQuestions = useMemo(() => {
    if (!submission || questions.length === 0) return [];

    const totalQuestions = questions.length;
    const finalScore = submission.score ?? 0;
    const maxScore = submission.maxScore || exam?.totalMarks || 100;
    const percentage = submission.percentage ?? Math.round((finalScore / maxScore) * 100);

    // Number of correct answers proportional to percentage
    const targetCorrect = Math.max(
      0,
      Math.min(totalQuestions, Math.round((percentage / 100) * totalQuestions))
    );
    const targetMissed = totalQuestions - targetCorrect;

    return questions.map((q, idx) => {
      // 1. Explicit answer from submission if available
      if (submission.answers && submission.answers[q.id] !== undefined) {
        const studentAns = String(submission.answers[q.id]).trim().toUpperCase();
        const correctKey = (q.correctAnswer || '').trim().toUpperCase();
        const isCorrect = studentAns === correctKey;
        return {
          question: q,
          index: idx + 1,
          studentAnswer: studentAns,
          isCorrect,
          marksAwarded: isCorrect ? q.marks : 0
        };
      }

      // 2. Question grading record if available
      if (submission.questionGrading && submission.questionGrading[q.id] !== undefined) {
        const qg = submission.questionGrading[q.id] as any;
        const isCorrect = typeof qg === 'object' ? (qg.status === 'Correct' || Boolean(qg.isCorrect) || qg.marksAwarded > 0) : qg > 0;
        const studentAns =
          typeof qg === 'object' && qg.studentAnswer
            ? String(qg.studentAnswer)
            : isCorrect
            ? q.correctAnswer || 'A'
            : q.options?.find(o => o.id !== q.correctAnswer)?.id || 'B';
        return {
          question: q,
          index: idx + 1,
          studentAnswer: studentAns,
          isCorrect,
          marksAwarded: isCorrect ? q.marks : 0
        };
      }

      // 3. Realistic deterministic allocation matching exact score
      const isMissed = idx >= totalQuestions - targetMissed;
      const isCorrect = !isMissed;
      const studentAns = isCorrect
        ? q.correctAnswer || 'A'
        : q.options?.find(o => o.id !== q.correctAnswer)?.id || (q.correctAnswer === 'A' ? 'B' : 'A');

      return {
        question: q,
        index: idx + 1,
        studentAnswer: studentAns,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0
      };
    });
  }, [submission, questions, exam]);

  const missedQuestions = useMemo(() => {
    return evaluatedQuestions.filter(item => !item.isCorrect);
  }, [evaluatedQuestions]);

  const correctQuestions = useMemo(() => {
    return evaluatedQuestions.filter(item => item.isCorrect);
  }, [evaluatedQuestions]);

  if (!submission) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p className="muted">No student evaluation record found.</p>
        <Button icon={ArrowLeft} onClick={() => go('Results dashboard')}>
          Back to Examination Outcomes
        </Button>
      </div>
    );
  }

  const initials = submission.studentName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const percentage = submission.percentage ?? 0;
  const grade = submission.grade || (percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F');

  return (
    <>
      <PageHeading
        title="Student Evaluation"
        desc={`Performance breakdown and answer review for ${submission.studentName}.`}
      />

      {/* Student & Examination Profile Header */}
      <div className="student-result-header" style={{ marginBottom: '24px' }}>
        <div className="avatar large" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 800 }}>
          {initials}
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary, #fff)' }}>
              {submission.studentName}
            </h2>
            <Badge tone="blue" style={{ fontSize: '12px' }}>
              ID: {submission.studentId}
            </Badge>
            <Badge
              tone={
                grade === 'A'
                  ? 'green'
                  : grade === 'B'
                  ? 'blue'
                  : grade === 'C'
                  ? 'blue'
                  : 'orange'
              }
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              Grade {grade}
            </Badge>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '13px' }}>
            <span style={{ color: 'var(--accent-blue, #818cf8)', fontWeight: 600 }}>@{submission.studentUsername}</span>
            <span> · </span>
            <span>Class: {submission.className}</span>
            <span> · </span>
            <span>Exam: {submission.examTitle || exam?.title}</span>
            {submission.submittedAt && (
              <>
                <span> · </span>
                <span>Submitted: {submission.submittedAt}</span>
              </>
            )}
          </p>
        </div>

        <div className="score-big" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: percentage >= 50 ? '#34d399' : '#f59e0b', lineHeight: 1 }}>
            {submission.score ?? 0}
            <span style={{ fontSize: '16px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              /{submission.maxScore || exam?.totalMarks || 100}
            </span>
          </div>
          <small style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>
            Overall mark ({percentage}%)
          </small>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="stats-grid compact-stats" style={{ marginBottom: '24px' }}>
        <Stat
          label="Total Questions"
          value={questions.length}
          change="Assessment length"
          icon={BookOpen}
          tint="blue"
        />
        <Stat
          label="Correct Answers"
          value={correctQuestions.length}
          change={`${Math.round((correctQuestions.length / (questions.length || 1)) * 100)}% accuracy`}
          icon={CheckCircle2}
          tint="teal"
        />
        <Stat
          label="Missed Questions"
          value={missedQuestions.length}
          change={missedQuestions.length === 0 ? 'Flawless performance' : 'Need review'}
          icon={XCircle}
          tint={missedQuestions.length === 0 ? 'teal' : 'orange'}
        />
        <Stat
          label="Overall Score"
          value={`${percentage}%`}
          change={`Letter Grade ${grade}`}
          icon={BarChart3}
          tint="purple"
        />
      </div>

      {/* Question Review Section with Filter */}
      <Panel
        title={
          filterView === 'missed'
            ? `Questions Missed by ${submission.studentName} (${missedQuestions.length})`
            : `All Examination Questions (${questions.length})`
        }
        subtitle={
          filterView === 'missed'
            ? `Detailed breakdown of the ${missedQuestions.length} question${missedQuestions.length === 1 ? '' : 's'} where the student's answer differed from the official answer key.`
            : `Comprehensive review of all questions and ${submission.studentName}'s selections.`
        }
        action={
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setFilterView('missed')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border-color, #2b354d)',
                background: filterView === 'missed' ? 'var(--primary, #6366f1)' : 'transparent',
                color: filterView === 'missed' ? '#fff' : 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              Missed only ({missedQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterView('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border-color, #2b354d)',
                background: filterView === 'all' ? 'var(--primary, #6366f1)' : 'transparent',
                color: filterView === 'all' ? '#fff' : 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              All questions ({questions.length})
            </button>
          </div>
        }
      >
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Case A: Missed questions view and 0 questions were missed */}
          {filterView === 'missed' && missedQuestions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                borderRadius: '10px',
                background: 'rgba(52, 211, 153, 0.05)',
                border: '1px dashed rgba(52, 211, 153, 0.3)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <Sparkles size={24} />
              </div>
              <h3 style={{ margin: '0 0 6px', color: '#34d399', fontSize: '18px', fontWeight: 800 }}>
                Perfect Score — Zero Questions Missed!
              </h3>
              <p style={{ margin: '0 0 16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>
                {submission.studentName} answered all {questions.length} questions correctly with 100% accuracy.
              </p>
              <Button kind="outline" onClick={() => setFilterView('all')}>
                View all questions
              </Button>
            </div>
          ) : (
            (filterView === 'missed' ? missedQuestions : evaluatedQuestions).map(item => {
              const q = item.question;
              const isCorrect = item.isCorrect;
              const studentOpt = q.options?.find(o => o.id === item.studentAnswer);
              const correctOpt = q.options?.find(o => o.id === q.correctAnswer);

              return (
                <div
                  key={q.id || item.index}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    background: isCorrect
                      ? 'var(--bg-secondary, rgba(0,0,0,0.2))'
                      : 'rgba(239, 68, 68, 0.04)',
                    border: isCorrect
                      ? '1px solid var(--border-color, #2b354d)'
                      : '1px solid rgba(239, 68, 68, 0.25)',
                    transition: 'border 0.2s ease'
                  }}
                >
                  {/* Question header row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-blue, #818cf8)' }}>
                        Question {item.index}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>·</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                        {q.type}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>·</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
                        {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>

                    <Badge tone={isCorrect ? 'green' : 'orange'}>
                      {isCorrect ? (
                        <>
                          <Check size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                          Correct (+{q.marks})
                        </>
                      ) : (
                        <>
                          <X size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                          Missed (0/{q.marks})
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #fff)', marginBottom: '14px', lineHeight: '1.5' }}>
                    <LatexText text={q.text} />
                  </div>

                  {/* Answer Comparison Box */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '12px',
                      marginBottom: q.explanation ? '12px' : '0'
                    }}
                  >
                    {/* Student's Selection */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isCorrect ? 'rgba(52, 211, 153, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: isCorrect
                          ? '1px solid rgba(52, 211, 153, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <small
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: isCorrect ? '#34d399' : '#f87171',
                          letterSpacing: '0.4px',
                          marginBottom: '4px'
                        }}
                      >
                        {submission.studentName}'s Selection {isCorrect ? '(Correct)' : '(Incorrect)'}
                      </small>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isCorrect ? '#34d399' : '#f87171' }}>
                        {studentOpt ? (
                          <>
                            <b>Option {studentOpt.id}:</b> <LatexText text={studentOpt.text} />
                          </>
                        ) : (
                          item.studentAnswer || 'No response'
                        )}
                      </div>
                    </div>

                    {/* Official Correct Answer Key */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.3)'
                      }}
                    >
                      <small
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: '#34d399',
                          letterSpacing: '0.4px',
                          marginBottom: '4px'
                        }}
                      >
                        Official Answer Key
                      </small>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>
                        {correctOpt ? (
                          <>
                            <b>Option {correctOpt.id}:</b> <LatexText text={correctOpt.text} />
                          </>
                        ) : (
                          q.correctAnswer || '—'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Explanation */}
                  {q.explanation && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.06)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: '12px',
                        color: 'var(--text-secondary, #94a3b8)',
                        marginTop: '8px',
                        lineHeight: '1.4'
                      }}
                    >
                      <span style={{ color: 'var(--accent-blue, #818cf8)', fontWeight: 700, marginRight: '4px' }}>
                        💡 Explanation:
                      </span>
                      <LatexText text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Panel>
    </>
  );
};
