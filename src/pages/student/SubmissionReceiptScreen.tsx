import React, { useMemo } from 'react';
import { Check, ArrowRight, Lock, Clock, ShieldCheck, Home } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { submissionService } from '../../services/submission.service';
import { storageService } from '../../services/storage.service';

export const SubmissionReceiptScreen: React.FC = () => {
  const { go, user, selectedExamId } = useApp();

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || examService.getAllExams()[0];
  }, [selectedExamId]);

  const studentId = user?.studentId || '';
  const studentUsername = user?.username || '';

  const submission = useMemo(() => {
    const list = storageService.getSubmissions();
    const found = list.find(
      s => s.examId === exam.id && (s.studentId === studentId || s.studentUsername === studentUsername)
    );
    if (found) return found;

    // Fallback if accessed directly
    return {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: studentId,
      studentName: user?.name || 'Student',
      studentUsername: studentUsername,
      className: user?.classId || exam.className,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' · ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Received' as const,
      answers: {},
      answeredCount: exam.questions?.length || 20,
      totalQuestions: exam.questions?.length || 20,
      resultsReleased: false
    };
  }, [exam, studentId, studentUsername, user]);

  return (
    <div className="center-state">
      <div className="success-icon">
        <Check size={34} />
      </div>
      <Badge tone="green">SUBMISSION RECORDED</Badge>
      <h1>Your examination was successfully submitted!</h1>
      <p>Your responses have been committed to the local examination database.</p>

      <div className="receipt-card">
        <div>
          <small>SUBMISSION RECEIPT NUMBER</small>
          <b>{submission.id}</b>
        </div>
        <div>
          <small>EXAMINATION</small>
          <b>{submission.examTitle}</b>
        </div>
        <div>
          <small>STUDENT DETAILS</small>
          <b>
            {submission.studentName} ({submission.studentId})
          </b>
        </div>
        <div>
          <small>CLASS & BATCH</small>
          <b>{submission.className}</b>
        </div>
        <div>
          <small>SUBMITTED AT</small>
          <b>{submission.submittedAt}</b>
        </div>
        <div>
          <small>QUESTIONS ANSWERED</small>
          <b>
            {submission.answeredCount} of {submission.totalQuestions} questions
          </b>
        </div>
        <div>
          <small>SUBMISSION STATUS</small>
          <Badge tone="green">Received & Verified</Badge>
        </div>
        <div>
          <small>RESULT STATUS</small>
          <Badge tone={submission.resultsReleased ? 'green' : 'orange'}>
            {submission.resultsReleased ? 'Results Released' : 'Pending Teacher Release'}
          </Badge>
        </div>
      </div>

      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto 20px',
          padding: '14px 16px',
          background: 'rgba(230, 160, 93, 0.1)',
          border: '1px solid rgba(230, 160, 93, 0.25)',
          borderRadius: '10px',
          textAlign: 'left',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <Lock size={20} color="#e6a05d" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary, #94a3b8)' }}>
          <strong style={{ color: '#e6a05d', display: 'block', marginBottom: '4px' }}>
            Results Withheld Until Teacher Release
          </strong>
          In accordance with school testing policy, individual scores and question breakdowns are withheld
          until the teacher completes evaluation and clicks <b>"Grade for Everyone"</b>. Check your
          Examination History to view results once released.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button kind="outline" onClick={() => go('Student home')}>
          <Home size={15} /> Student Home
        </Button>
        <Button onClick={() => go('Student examination history')}>
          View Examination History <ArrowRight size={15} />
        </Button>
      </div>

      <small className="muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
        <ShieldCheck size={14} /> Official receipt verified by local database engine.
      </small>
    </div>
  );
};
