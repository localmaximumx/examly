import React, { useMemo, useState, useEffect } from 'react';
import { Clock3, FileText, AlertCircle, ArrowRight, ShieldCheck, Hourglass, CheckCircle2 } from 'lucide-react';
import { Badge, Button, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';

export const ExamInstructionsScreen: React.FC = () => {
  const { go, selectedExamId, examTitle, user, notify } = useApp();
  const studentId = user?.studentId || user?.username || '';

  const [poll, setPoll] = useState(0);

  useEffect(() => {
    const handleStorage = () => setPoll(p => p + 1);
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setPoll(p => p + 1), 1500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const studentExams = useMemo(() => {
    return examService.getExamsForStudent(user?.username || studentId);
  }, [user, studentId, poll]);

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || studentExams[0] || null;
  }, [selectedExamId, studentExams]);

  const student = useMemo(() => {
    return storageService.getStudents().find(
      s => s.id === studentId || s.studentId === studentId || s.username === user?.username
    );
  }, [studentId, user, poll]);

  const assignedClasses = useMemo(() => {
    if (!exam) return [];
    return (exam.assignedClassNames || []).filter(c => c && c !== 'Unassigned').map(c => c.toLowerCase());
  }, [exam]);

  const isEnrolled = useMemo(() => {
    if (!exam || !student || !student.className || student.className === 'Unassigned') return false;
    const check = examService.canStudentEnterExam(exam.id, studentId);
    return check.allowed || check.status === 'WaitingForStart' || check.status === 'Submitted';
  }, [student, exam, studentId, poll]);

  const isExamLive = exam?.status === 'Active';

  const handleStartExam = () => {
    if (!exam) return;
    const check = examService.canStudentEnterExam(exam.id, studentId);
    if (!check.allowed) {
      notify(check.reason || 'Cannot enter exam at this moment.');
      return;
    }
    go('Main examination');
  };

  if (!exam) {
    return (
      <div className="center-state">
        <Badge tone="orange">EXAMINATION UNAVAILABLE</Badge>
        <h1>Examination Not Found</h1>
        <p style={{ maxWidth: '540px', margin: '0 auto 24px' }}>
          This examination is not assigned to your classroom or is no longer available.
        </p>
        <Button kind="primary" onClick={() => go('Student home')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="exam-topline">
        <div>
          <Badge tone={isExamLive ? 'green' : 'blue'}>
            {isExamLive ? 'LIVE SYNCHRONIZED SESSION' : 'EXAMINATION WAITING ROOM'}
          </Badge>
          <h1><LatexText text={exam.title || examTitle} /></h1>
          <p>
            {exam.subject} <span>·</span> {exam.className} <span>·</span> {exam.code}
          </p>
        </div>
        <div className="exam-countdown">
          <Clock3 size={19} />
          <div>
            <small>OFFICIAL DURATION</small>
            <b>{exam.duration}</b>
          </div>
        </div>
      </div>

      <div className="instructions-layout">
        <div className="panel form-panel">
          <div className="instruction-icon">
            <FileText size={22} />
          </div>
          <h2>Examination Instructions & Room Status</h2>
          <p className="muted">
            All students and teachers share the exact same synchronized exam timer. Read these
            instructions carefully while waiting for the teacher to signal start.
          </p>

          <div className="instruction-list">
            {[
              `Official duration: ${exam.duration}. The timer is controlled synchronously by the teacher.`,
              'All questions are strictly Multiple Choice (Choose) and True/False questions.',
              'Your selections are saved automatically to the local database as you answer.',
              'You may navigate between questions freely and mark questions for review.',
              'When the synchronized official timer expires, all papers are automatically submitted.',
              'Results will be visible in your portal once the teacher grades and releases results for everyone.'
            ].map((t, i) => (
              <div key={t}>
                <span>{i + 1}</span>
                {t}
              </div>
            ))}
          </div>

          {!isEnrolled ? (
            <div
              style={{
                padding: '14px',
                borderRadius: '9px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '18px 0',
                color: 'var(--text-primary, #f1f5f9)'
              }}
            >
              <AlertCircle size={22} color="#eab308" />
              <div>
                <b style={{ color: '#eab308' }}>Not Invited Yet</b>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                  You are viewing the examination overview, duration, and question count. You will be able to take the exam once your teacher invites/assigns you to this examination and starts the session.
                </p>
              </div>
            </div>
          ) : !isExamLive ? (
            <div
              style={{
                padding: '14px',
                borderRadius: '9px',
                background: 'rgba(101, 119, 232, 0.12)',
                border: '1px solid rgba(101, 119, 232, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '18px 0',
                color: 'var(--text-primary, #f1f5f9)'
              }}
            >
              <Hourglass size={22} color="#7787f1" />
              <div>
                <b>Waiting Room: Enrolled</b>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                  You are enrolled in this examination. The "Enter Live Exam" button will unlock as soon
                  as the teacher clicks <b>Confirm and start</b> on their console.
                </p>
              </div>
            </div>
          ) : (
            <div className="warning-note">
              <AlertCircle size={17} />
              <span>
                The examination is now LIVE! The official clock is running. Enter immediately to make
                full use of your allocated time.
              </span>
            </div>
          )}

          <div className="form-footer">
            <Button kind="outline" onClick={() => go('Student home')}>
              Go back
            </Button>
            <Button onClick={handleStartExam} disabled={!isExamLive || !isEnrolled}>
              {!isEnrolled ? (
                'Waiting for Teacher Invitation...'
              ) : isExamLive ? (
                <>
                  Enter Live Examination <ArrowRight size={15} />
                </>
              ) : (
                'Waiting for Teacher to Start...'
              )}
            </Button>
          </div>
        </div>

        <aside className="panel exam-overview">
          <h3>Examination overview</h3>
          <div className="overview-line">
            <span>Subject</span>
            <b>{exam.subject}</b>
          </div>
          <div className="overview-line">
            <span>Question count</span>
            <b>{exam.questions.length} questions</b>
          </div>
          <div className="overview-line">
            <span>Official duration</span>
            <b>{exam.duration}</b>
          </div>
          <div className="overview-line">
            <span>Total marks</span>
            <b>{exam.totalMarks} marks</b>
          </div>
          <div className="overview-line">
            <span>Room Admission</span>
            <b style={{ color: isEnrolled ? '#34d399' : '#eab308' }}>
              {isEnrolled ? 'Enrolled & Authorized' : 'Not Invited Yet'}
            </b>
          </div>
          <Badge tone={isExamLive ? 'green' : 'blue'}>
            <ShieldCheck size={12} /> Synchronized Session
          </Badge>
        </aside>
      </div>
    </>
  );
};
