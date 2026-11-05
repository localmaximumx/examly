import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  BarChart3,
  Check,
  X,
  Award
} from 'lucide-react';
import { PageHeading, Button, Panel, Badge, Stat, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { Question } from '../../types';

export const StudentResultScreen: React.FC = () => {
  const { go, user, selectedExamId, dataVersion } = useApp();
  const [filterView, setFilterView] = useState<'missed' | 'all'>('missed');

  const studentUser = user?.username || '';
  const studentId = user?.studentId || '';

  const studentExams = useMemo(() => {
    return examService.getExamsForStudent(studentUser || studentId);
  }, [studentUser, studentId, dataVersion]);

  const submission = useMemo(() => {
    const list = storageService.getSubmissions();
    if (selectedExamId) {
      const found = list.find(
        s => (s.examId === selectedExamId || s.id === selectedExamId) &&
             (s.studentUsername === studentUser || s.studentId === studentId)
      );
      if (found) return found;
    }
    return list.find(
      s => s.studentUsername === studentUser || s.studentId === studentId
    ) || null;
  }, [selectedExamId, studentUser, studentId, dataVersion]);

  const exam = useMemo(() => {
    if (submission?.examId) {
      const found = examService.getExamById(submission.examId);
      if (found) return found;
    }
    if (selectedExamId) {
      const found = examService.getExamById(selectedExamId);
      if (found) return found;
    }
    return studentExams[0] || null;
  }, [submission, selectedExamId, studentExams]);

  const questions = useMemo<Question[]>(() => {
    return exam?.questions || [];
  }, [exam]);

  // Deterministic question evaluation matching the submission record
  const evaluatedQuestions = useMemo(() => {
    if (!submission || questions.length === 0) return [];

    const totalQuestions = questions.length;
    const finalScore = submission.score ?? 0;
    const maxScore = submission.maxScore || exam?.totalMarks || 100;
    const percentage = submission.percentage ?? Math.round((finalScore / maxScore) * 100);

    const targetCorrect = Math.max(
      0,
      Math.min(totalQuestions, Math.round((percentage / 100) * totalQuestions))
    );
    const targetMissed = totalQuestions - targetCorrect;

    return questions.map((q, idx) => {
      // 1. Explicit answer from submission if available
      let studentAns = '';
      if (submission.answers && submission.answers[q.id] !== undefined) {
        const rawAns = submission.answers[q.id] as any;
        if (typeof rawAns === 'string') {
          studentAns = rawAns.trim();
        } else if (rawAns && typeof rawAns === 'object') {
          studentAns = String(rawAns.selectedOption ?? rawAns.answer ?? rawAns.id ?? '').trim();
        }
      }

      if (!studentAns && submission.questionGrading && submission.questionGrading[q.id] !== undefined) {
        const qg = submission.questionGrading[q.id] as any;
        if (typeof qg === 'object' && qg.studentAnswer) {
          studentAns = String(qg.studentAnswer).trim();
        }
      }

      if (studentAns.toLowerCase() === '[object object]') {
        studentAns = '';
      }

      const correctKey = (q.correctAnswer || '').trim();
      let isCorrect = false;
      let marksAwarded = 0;

      if (studentAns) {
        isCorrect = studentAns.toUpperCase() === correctKey.toUpperCase();
        marksAwarded = isCorrect ? q.marks : 0;
      } else if (submission.questionGrading && submission.questionGrading[q.id] !== undefined) {
        const qg = submission.questionGrading[q.id] as any;
        isCorrect = typeof qg === 'object' ? (qg.status === 'Correct' || Boolean(qg.isCorrect) || qg.marksAwarded > 0) : qg > 0;
        marksAwarded = isCorrect ? q.marks : 0;
        studentAns = isCorrect ? correctKey : (q.options?.find(o => o.id.toUpperCase() !== correctKey.toUpperCase())?.id || 'B');
      } else {
        const isMissed = idx >= totalQuestions - targetMissed;
        isCorrect = !isMissed;
        marksAwarded = isCorrect ? q.marks : 0;
        studentAns = isCorrect
          ? correctKey || 'A'
          : q.options?.find(o => o.id.toUpperCase() !== correctKey.toUpperCase())?.id || (correctKey === 'A' ? 'B' : 'A');
      }

      return {
        question: q,
        index: idx + 1,
        studentAnswer: studentAns,
        isCorrect,
        marksAwarded
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
      <div className="center-state">
        <div
          className="confirm-icon"
          style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-blue, #818cf8)' }}
        >
          <Clock size={36} />
        </div>
        <Badge tone="blue">RECORD NOT FOUND</Badge>
        <h1>No Submission Recorded</h1>
        <p style={{ maxWidth: '540px', margin: '0 auto 24px' }}>
          We could not find a submitted examination record for your student account under this assessment.
        </p>
        <Button kind="outline" onClick={() => go('Student home')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isReleased = Boolean(submission.resultsReleased);

  // If results are NOT released yet, withhold the score
  if (!isReleased) {
    return (
      <div className="center-state">
        <div
          className="confirm-icon"
          style={{ background: 'rgba(230, 160, 93, 0.15)', color: '#e6a05d' }}
        >
          <Lock size={36} />
        </div>
        <Badge tone="orange">RESULTS WITHHELD</Badge>
        <h1>Results Not Yet Released</h1>
        <p style={{ maxWidth: '540px', margin: '0 auto 24px' }}>
          Your submission for <b>{exam?.title || submission?.examTitle || 'this examination'}</b> has been
          safely recorded, but the teacher has not yet released the results. Results will appear here once
          your teacher publishes grading.
        </p>

        <div className="receipt-card" style={{ maxWidth: '480px', margin: '0 auto 24px' }}>
          <div>
            <small>EXAMINATION</small>
            <b>{submission?.examTitle || exam?.title}</b>
          </div>
          <div>
            <small>STUDENT NAME</small>
            <b>{user?.name || submission?.studentName}</b>
          </div>
          <div>
            <small>STATUS</small>
            <Badge tone="orange">Pending Teacher Release</Badge>
          </div>
          <div>
            <small>SUBMITTED AT</small>
            <b>{submission?.submittedAt || 'Recorded'}</b>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button kind="outline" onClick={() => go('Student home')}>
            Back to Home
          </Button>
          <Button onClick={() => go('Student examination history')}>
            <ArrowLeft size={14} /> Back to History
          </Button>
        </div>
      </div>
    );
  }

  // Released Result View
  const score = submission.score ?? 0;
  const maxScore = submission.maxScore || exam?.totalMarks || 100;
  const percentage = submission.percentage ?? Math.round((score / (maxScore || 1)) * 100);
  const grade = submission.grade || (percentage >= 85 ? 'A' : percentage >= 75 ? 'B' : percentage >= 65 ? 'C' : percentage >= 50 ? 'D' : 'F');
  const feedback =
    submission.teacherFeedback ||
    (percentage >= 75
      ? 'Great performance! All multiple-choice and true/false answers were evaluated successfully against the answer key.'
      : 'Good effort! Review the missed questions below to master these concepts.');

  const initials = (user?.name || submission.studentName || 'Student')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeading
        title="Examination result"
        desc={`Detailed performance breakdown, score report, and question evaluation for ${submission.examTitle || exam?.title}.`}
        action={
          <Button
            kind="outline"
            onClick={() => go('Student examination history')}
          >
            <ArrowLeft size={14} /> Back to history
          </Button>
        }
      />

      {/* Student Result Profile Header */}
      <div className="student-result-header" style={{ marginBottom: '24px' }}>
        <div className="avatar large" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 800 }}>
          {initials}
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary, #fff)' }}>
              {user?.name || submission.studentName}
            </h2>
            <Badge tone="blue" style={{ fontSize: '12px' }}>
              ID: {user?.studentId || submission.studentId}
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
            <span style={{ color: 'var(--accent-blue, #818cf8)', fontWeight: 600 }}>@{studentUser}</span>
            <span> · </span>
            <span>Class: {submission.className || user?.className || 'Classroom'}</span>
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
            {score}
            <span style={{ fontSize: '16px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              /{maxScore}
            </span>
          </div>
          <small style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>
            Overall mark ({percentage}%)
          </small>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
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

      {/* Performance Summary & Teacher Remarks */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <Panel
          title="Your performance"
          subtitle={submission.examTitle || exam?.title}
        >
          <div className="result-score">
            <b>{percentage}%</b>
            <Badge tone={percentage >= 50 ? 'green' : 'orange'}>Grade {grade}</Badge>
          </div>
          <div className="grade-bars">
            <div className="grade-bar-row">
              <b>Your score</b>
              <div>
                <i style={{ width: `${Math.min(100, percentage)}%` }} />
              </div>
              <small>{percentage}%</small>
            </div>
            <div className="grade-bar-row">
              <b>Passing benchmark</b>
              <div>
                <i style={{ width: '50%' }} />
              </div>
              <small>50%</small>
            </div>
          </div>
        </Panel>

        <Panel title="Teacher feedback" subtitle="Official remarks">
          <div className="feedback-card">
            <Sparkles size={19} />
            <p>{feedback}</p>
            <small>— Lead Instructor Evaluation</small>
          </div>
        </Panel>
      </div>

      {/* QUESTION-BY-QUESTION BREAKDOWN WITH MISSED / ALL TABS */}
      <Panel
        title={`Question Analysis (${evaluatedQuestions.length} Questions)`}
        subtitle="Detailed review of your answers against the official answer keys and grading rationale"
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              kind={filterView === 'missed' ? 'primary' : 'outline'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setFilterView('missed')}
            >
              Missed only ({missedQuestions.length})
            </Button>
            <Button
              kind={filterView === 'all' ? 'primary' : 'outline'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setFilterView('all')}
            >
              All questions ({evaluatedQuestions.length})
            </Button>
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
                You answered all {questions.length} questions correctly with 100% accuracy.
              </p>
              <Button kind="outline" onClick={() => setFilterView('all')}>
                View all questions
              </Button>
            </div>
          ) : (
            (filterView === 'missed' ? missedQuestions : evaluatedQuestions).map(item => {
              const q = item.question;
              const isCorrect = item.isCorrect;
              const studentOpt = q.options?.find(
                o => o.id.trim().toUpperCase() === item.studentAnswer.trim().toUpperCase()
              );
              const correctOpt = q.options?.find(
                o => o.id.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase()
              );

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
                        Your Selection {isCorrect ? '(Correct)' : '(Incorrect)'}
                      </small>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isCorrect ? '#34d399' : '#f87171' }}>
                        {studentOpt ? (
                          <>
                            <b>Option {studentOpt.id}:</b> <LatexText text={studentOpt.text} />
                          </>
                        ) : item.studentAnswer && item.studentAnswer.toLowerCase() !== '[object object]' ? (
                          item.studentAnswer
                        ) : (
                          'No response'
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
                          q.correctAnswer || 'N/A'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Explanation */}
                  {q.explanation && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary, rgba(0,0,0,0.2))',
                        border: '1px solid var(--border-color, #2b354d)',
                        fontSize: '12px',
                        color: 'var(--text-secondary, #94a3b8)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginTop: '10px'
                      }}
                    >
                      <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
                      <div>
                        <strong style={{ color: 'var(--text-primary, #fff)', marginRight: '4px' }}>
                          Explanation:
                        </strong>
                        <LatexText text={q.explanation} />
                      </div>
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
