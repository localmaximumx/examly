import React, { useMemo, useState, useEffect } from 'react';
import { Send, Clock3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';
import { submissionService } from '../../services/submission.service';

export const SubmissionConfirmationScreen: React.FC = () => {
  const { go, user, selectedExamId, notify, refreshData } = useApp();

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || examService.getAllExams()[0];
  }, [selectedExamId]);

  const studentKey = user?.studentId || user?.username || 'STU-1001';
  const savedAnswers = useMemo(() => {
    return storageService.getStudentExamAnswers(exam.id, studentKey);
  }, [exam.id, studentKey]);

  const totalQuestions = exam.questions.length > 0 ? exam.questions.length : 20;
  const answeredCount = Object.keys(savedAnswers).filter(k => savedAnswers[k]).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Synchronized countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    storageService.getExamRemainingSeconds(exam.id)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(storageService.getExamRemainingSeconds(exam.id));
    }, 1000);
    return () => clearInterval(timer);
  }, [exam.id]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConfirmSubmission = () => {
    const res = submissionService.submitExam({
      examId: exam.id,
      studentId: user?.studentId || 'STU-1001',
      studentName: user?.name || 'Abel Tesfaye',
      studentUsername: user?.username || 'abel.tesfaye',
      className: user?.classId || exam.className,
      answers: savedAnswers
    });

    if (res.success) {
      refreshData();
      notify('Examination successfully submitted! Stored in local database.');
      go('Submission receipt');
    } else {
      notify(res.message || 'Submission completed.');
      go('Submission receipt');
    }
  };

  return (
    <div className="center-state">
      <div className="confirm-icon">
        <Send size={30} />
      </div>
      <Badge tone="orange">FINAL SUBMISSION CHECK</Badge>
      <h1>Submit your examination?</h1>
      <p>
        Once confirmed, your answers will be committed to the school examination database. You
        cannot modify your choices after submission.
      </p>

      {unansweredCount > 0 && (
        <div
          style={{
            maxWidth: '460px',
            margin: '0 auto 18px',
            padding: '10px 14px',
            background: 'rgba(230, 160, 93, 0.12)',
            border: '1px solid rgba(230, 160, 93, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#e6a05d',
            textAlign: 'left'
          }}
        >
          <AlertTriangle size={18} />
          <span>
            You have <b>{unansweredCount} unanswered questions</b>. You can continue the exam or submit now.
          </span>
        </div>
      )}

      <div className="confirm-summary">
        <div>
          <small>EXAMINATION</small>
          <b>{exam.title}</b>
        </div>
        <div>
          <small>ANSWERED QUESTIONS</small>
          <b style={{ color: '#34d399' }}>{answeredCount} of {totalQuestions}</b>
        </div>
        <div>
          <small>UNANSWERED QUESTIONS</small>
          <b style={{ color: unansweredCount > 0 ? '#e6a05d' : undefined }}>{unansweredCount} questions</b>
        </div>
        <div>
          <small>TIME REMAINING</small>
          <b>{formatTimer(secondsRemaining)}</b>
        </div>
      </div>

      <div className="confirm-actions">
        <Button kind="outline" onClick={() => go('Main examination')}>
          Continue exam
        </Button>
        <Button onClick={handleConfirmSubmission}>
          Confirm submission <Send size={15} />
        </Button>
      </div>
    </div>
  );
};
