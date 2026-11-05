import React, { useMemo } from 'react';
import { ArrowLeft, Sparkles, Lock, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { PageHeading, Button, Panel, Badge } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';

export const StudentResultScreen: React.FC = () => {
  const { go, user, selectedExamId } = useApp();

  const studentUser = user?.username || '';
  const studentId = user?.studentId || '';

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || examService.getAllExams()[0];
  }, [selectedExamId]);

  const submission = useMemo(() => {
    const list = storageService.getSubmissions();
    // Prioritize submission for this student and exam
    const studentSub = list.find(
      s => (s.examId === selectedExamId || s.id === selectedExamId) &&
           (s.studentUsername === studentUser || s.studentId === studentId)
    );
    if (studentSub) return studentSub;

    // Fallback: check any submission for this exam or student
    return list.find(s => s.examId === selectedExamId) ||
           list.find(s => s.studentUsername === studentUser) ||
           list[0];
  }, [user, selectedExamId, studentUser, studentId]);

  const isReleased = Boolean(submission?.resultsReleased);

  // If results are NOT released yet, withhold the score completely
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
          safely recorded, but the teacher has not yet completed evaluation. Results will appear here once
          your teacher selects <b>"Grade for Everyone"</b>.
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
  const score = submission?.score ?? 85;
  const grade = submission?.grade || 'A';
  const maxScore = submission?.maxScore || 100;
  const feedback =
    submission?.teacherFeedback ||
    'Great performance! All multiple-choice and true/false answers were evaluated successfully against the answer key.';

  return (
    <>
      <PageHeading
        title="Examination result"
        desc="Review your released examination score, grade, and teacher feedback."
        action={
          <Button
            kind="outline"
            onClick={() => go('Student examination history')}
          >
            <ArrowLeft size={14} /> Back to history
          </Button>
        }
      />

      <div className="student-result-header">
        <div className="avatar large">
          {user?.avatarText || 'AB'}
        </div>
        <div>
          <h2>{user?.name || submission?.studentName || 'Student'}</h2>
          <p>
            {user?.studentId || submission?.studentId || 'N/A'} ·{' '}
            {submission?.className || user?.classId || 'Classroom'} · {submission?.examTitle || exam.title}
          </p>
        </div>
        <Badge tone="green">
          <CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
          Result released
        </Badge>
        <div className="score-big">
          {score}
          <span>/{maxScore}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <Panel
          title="Your performance"
          subtitle={submission?.examTitle || exam.title}
        >
          <div className="result-score">
            <b>{score}%</b>
            <Badge tone="green">Grade {grade}</Badge>
          </div>
          <div className="grade-bars">
            <div className="grade-bar-row">
              <b>Your score</b>
              <div>
                <i style={{ width: `${score}%` }} />
              </div>
              <small>{score}%</small>
            </div>
            <div className="grade-bar-row">
              <b>Class average</b>
              <div>
                <i style={{ width: '78%' }} />
              </div>
              <small>78%</small>
            </div>
          </div>
        </Panel>

        <Panel title="Teacher feedback" subtitle="Official remarks">
          <div className="feedback-card">
            <Sparkles size={19} />
            <p>{feedback}</p>
            <small>— Lead Instructor</small>
          </div>
        </Panel>
      </div>

      <Panel
        title="Evaluation details"
        subtitle="Automatic grading verified by teacher"
      >
        <p className="muted" style={{ padding: '0 20px 18px' }}>
          This examination was evaluated automatically using the official answer keys for Multiple Choice
          and True/False items. Questions answered correctly: {Math.round((score / 100) * (submission?.totalQuestions || 20))} of {submission?.totalQuestions || 20}.
        </p>
      </Panel>
    </>
  );
};
