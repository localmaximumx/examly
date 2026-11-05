import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Timer,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flag,
  AlertCircle,
  Pause
} from 'lucide-react';
import { Badge, Button, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';
import { submissionService } from '../../services/submission.service';
import { Question } from '../../types';

export const MainExaminationScreen: React.FC = () => {
  const { go, user, selectedExamId, notify, refreshData } = useApp();

  const [poll, setPoll] = useState(0);

  useEffect(() => {
    const handleStorage = () => setPoll(p => p + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || examService.getAllExams()[0];
  }, [selectedExamId, poll]);

  // Questions: Load exact questions authored by teacher, strictly omitting answer keys
  const questions: Question[] = useMemo(() => {
    const rawList = exam.questions && exam.questions.length > 0 ? exam.questions : [];

    // STRICT CONFIDENTIALITY: Under no circumstances should correctAnswer or explanation be in student memory
    return rawList.map(q => ({
      id: q.id,
      questionNumber: q.questionNumber,
      text: q.text,
      type: q.type,
      marks: q.marks,
      options: q.options
    }));
  }, [exam]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQ = questions[currentQuestionIndex] || questions[0];

  // Persistent Answers in local database
  const studentKey = user?.studentId || user?.username || 'STU-STUDENT';
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    return storageService.getStudentExamAnswers(exam.id, studentKey);
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

  // Unified synchronized countdown timer from local database (tied to exam.endTime)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return storageService.getExamRemainingSeconds(exam.id);
  });
  const [hasNotified5Min, setHasNotified5Min] = useState(false);

  // Guard: student must be enrolled and exam must be Active to access questions
  useEffect(() => {
    const check = examService.canStudentEnterExam(exam.id, studentKey);
    if (!check.allowed) {
      notify(check.reason || 'This examination has not started or access is restricted.');
      go('Student home');
    }
  }, [exam.id, exam.status, studentKey, go, notify]);

  // Immediate storage change listener: e.g. student removed from classroom in real-time
  useEffect(() => {
    const handleStorage = () => {
      const check = examService.canStudentEnterExam(exam.id, studentKey);
      if (!check.allowed) {
        notify(check.reason || 'You have been removed from this classroom. Your examination session has ended.');
        go('Student home');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [exam.id, studentKey, go, notify]);

  // Synchronized countdown timer effect
  useEffect(() => {
    if (exam.status !== 'Active') return;

    const tick = () => {
      // Real-time enrollment and active status verification
      const check = examService.canStudentEnterExam(exam.id, studentKey);
      if (!check.allowed) {
        notify(check.reason || 'You have been removed from this classroom. Your examination session has ended.');
        go('Student home');
        return;
      }

      const remaining = storageService.getExamRemainingSeconds(exam.id);
      setSecondsRemaining(remaining);

      // If exam is paused by teacher, do not countdown or auto-submit
      if (exam.isPaused) return;

      // 5-minute notification trigger
      if (remaining > 300) {
        setHasNotified5Min(false);
      } else if (remaining <= 300 && remaining > 0 && !hasNotified5Min) {
        setHasNotified5Min(true);
        notify('⚠️ 5 minutes remaining! Please review and finalize your answers before time expires.');
      }

      if (remaining <= 0) {
        // Auto-submit examination
        notify('Time has expired! Automatically submitting your examination...');
        const currentAns = storageService.getStudentExamAnswers(exam.id, studentKey);
        submissionService.submitExam({
          examId: exam.id,
          studentId: user?.studentId || 'STU-STUDENT',
          studentName: user?.name || 'Student',
          studentUsername: user?.username || 'student',
          className: user?.classId || exam.className,
          answers: currentAns
        });
        refreshData();
        go('Submission receipt');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [exam.id, exam.status, exam.isPaused, studentKey, user, go, notify, refreshData, hasNotified5Min]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: string) => {
    const updated = { ...answers, [currentQ.id]: optionId };
    setAnswers(updated);
    storageService.saveStudentExamAnswers(exam.id, studentKey, updated);
  };

  const handleClearAnswer = () => {
    const updated = { ...answers };
    delete updated[currentQ.id];
    setAnswers(updated);
    storageService.saveStudentExamAnswers(exam.id, studentKey, updated);
  };

  const handleToggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100
  );

  return (
    <>
      <div className="exam-topline">
        <div>
          <Badge tone="blue">
            {exam.subject.toUpperCase()} · {exam.code}
          </Badge>
          <h1>{exam.title}</h1>
          <p>
            {exam.className} <span>·</span> Question {currentQuestionIndex + 1} of{' '}
            {questions.length}
          </p>
        </div>

        <div className="exam-countdown" style={{ border: exam.isPaused ? '1px solid rgba(245, 158, 11, 0.6)' : secondsRemaining <= 300 ? '1px solid rgba(239, 68, 68, 0.5)' : undefined }}>
          {exam.isPaused ? (
            <Pause size={19} color="#f59e0b" />
          ) : (
            <Timer size={19} color={secondsRemaining <= 300 ? '#ef4444' : undefined} />
          )}
          <div>
            <small style={{ color: exam.isPaused ? '#f59e0b' : secondsRemaining <= 300 ? '#ef4444' : undefined }}>
              {exam.isPaused ? 'PAUSED BY TEACHER' : secondsRemaining <= 300 ? '⚠️ TIME EXPIRING SOON' : 'SYNCHRONIZED OFFICIAL TIMER'}
            </small>
            <b style={{ color: exam.isPaused ? '#f59e0b' : secondsRemaining <= 300 ? '#ef4444' : undefined, fontSize: '18px' }}>
              {formatTimer(secondsRemaining)}
            </b>
          </div>
          {exam.isPaused ? (
            <Badge tone="orange">PAUSED</Badge>
          ) : secondsRemaining <= 300 ? (
            <Badge tone="orange">5 Min Left</Badge>
          ) : (
            <Badge tone="green">Synchronized</Badge>
          )}
        </div>
      </div>

      {exam.isPaused && (
        <div
          style={{
            margin: '0 0 16px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#f59e0b'
          }}
        >
          <Pause size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <b style={{ display: 'block', fontSize: '13px' }}>Examination Paused by Teacher</b>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #cbd5e1)' }}>
              The examination timer has been temporarily halted by your proctor. You can continue reviewing questions and selecting answers. The timer will resume when the teacher unpauses.
            </span>
          </div>
        </div>
      )}

      {!exam.isPaused && secondsRemaining <= 300 && secondsRemaining > 0 && (
        <div
          style={{
            margin: '0 0 16px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#f87171'
          }}
        >
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <b style={{ display: 'block', fontSize: '13px' }}>⚠️ 5 Minutes Remaining!</b>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #cbd5e1)' }}>
              Only 5 minutes remain for this examination session. Please double-check your answers and prepare to submit.
            </span>
          </div>
        </div>
      )}

      <div className="exam-progress">
        <div style={{ width: `${progressPercent}%` }} />
        <span>{progressPercent}% complete</span>
      </div>

      <div className="take-layout">
        <div className="panel question-panel">
          <div className="question-head">
            <Badge tone="blue">QUESTION {currentQuestionIndex + 1} OF {questions.length}</Badge>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="text-link"
                style={{
                  color: markedForReview[currentQ.id] ? '#d68d4d' : undefined,
                  fontSize: '12px'
                }}
                onClick={handleToggleReview}
              >
                <Flag size={12} /> {markedForReview[currentQ.id] ? 'Marked for review' : 'Mark for review'}
              </button>
              <span>{currentQ.marks} marks</span>
            </div>
          </div>

          <h2>
            <LatexText text={currentQ.text} />
          </h2>
          <p className="muted">
            {currentQ.type === 'True/false'
              ? 'Select True or False for this statement.'
              : 'Choose the single best answer from the choices below.'}
          </p>

          <div className="answer-options">
            {currentQ.options?.map(o => {
              const isSelected = answers[currentQ.id] === o.id;
              return (
                <button
                  key={o.id}
                  className={`answer-option ${isSelected ? 'chosen' : ''}`}
                  onClick={() => handleSelectOption(o.id)}
                >
                  <span>{o.id}</span>
                  <LatexText text={o.text} />
                  {isSelected && <Check size={17} />}
                </button>
              );
            })}
          </div>

          <div className="question-actions">
            <button className="text-link" onClick={handleClearAnswer}>
              Clear selection
            </button>
            <div>
              <Button
                kind="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={15} /> Previous
              </Button>
              <Button
                onClick={() => {
                  if (currentQuestionIndex === questions.length - 1) {
                    go('Submission confirmation');
                  } else {
                    setCurrentQuestionIndex(prev => prev + 1);
                  }
                }}
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  'Review & Submit'
                ) : (
                  <>
                    Next question <ChevronRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <aside className="panel question-nav">
          <h3>Question navigator</h3>
          <p className="muted">Click any question number to navigate.</p>

          <div className="question-grid">
            {questions.map((q, i) => {
              const isCurrent = currentQuestionIndex === i;
              const hasAnswer = Boolean(answers[q.id]);
              const isMarked = markedForReview[q.id];

              let className = '';
              if (isCurrent) className = 'current';
              else if (hasAnswer) className = 'answered';

              return (
                <button
                  key={q.id}
                  className={className}
                  style={isMarked && !isCurrent ? { borderColor: '#e6a05d', color: '#c98442' } : {}}
                  onClick={() => setCurrentQuestionIndex(i)}
                  title={`Question ${i + 1}${isMarked ? ' (Marked for review)' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="legend">
            <span>
              <i className="legend-current" /> Current
            </span>
            <span>
              <i className="legend-answered" /> Answered
            </span>
            <span>
              <i /> Unanswered
            </span>
          </div>

          <div className="save-status">
            <CheckCircle2 size={14} /> Answers saved to local database
          </div>

          <Button
            block
            kind="outline"
            onClick={() => go('Submission confirmation')}
          >
            Submit examination
          </Button>
        </aside>
      </div>
    </>
  );
};
