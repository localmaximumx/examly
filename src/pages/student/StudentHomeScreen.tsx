import React, { useMemo, useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Clock3,
  ListChecks,
  CalendarDays,
  FileCheck2,
  Send,
  CheckCircle2,
  Hourglass,
  Lock,
  Users,
  Check,
  X
} from 'lucide-react';
import { Badge, Button, Panel, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';
import { formatDisplayDate } from '../../utils/date.utils';

export const StudentHomeScreen: React.FC = () => {
  const { go, user, setSelectedExamId, setExamTitle, dataVersion, refreshData, notify } = useApp();
  const studentId = user?.studentId || user?.username || '';

  // State to poll or refresh on storage changes
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const handleStorage = () => setPollCount(c => c + 1);
    window.addEventListener('storage', handleStorage);
    // Poll every 2 seconds for live teacher start / approval events
    const interval = setInterval(() => setPollCount(c => c + 1), 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const studentExams = useMemo(() => {
    return examService.getExamsForStudent(user?.username || user?.studentId || '');
  }, [user, dataVersion, pollCount]);

  // Display only the last five exams on the dashboard as requested
  const displayedExams = useMemo(() => {
    return studentExams.slice(0, 5);
  }, [studentExams]);

  const activeOrUpcomingExam = displayedExams[0] || null;

  const isEnrolledInActiveExam = useMemo(() => {
    if (!activeOrUpcomingExam) return false;
    const check = examService.canStudentEnterExam(activeOrUpcomingExam.id, studentId);
    return check.allowed || check.status === 'WaitingForStart' || check.status === 'Submitted';
  }, [activeOrUpcomingExam, studentId, pollCount]);

  // Real Submissions
  const submissions = useMemo(() => {
    return storageService.getSubmissions().filter(
      s => s.studentUsername === user?.username || s.studentId === user?.studentId
    );
  }, [user, dataVersion, pollCount]);

  // Join permission state for the primary assessment
  const joinStatus = useMemo(() => {
    if (!activeOrUpcomingExam) return 'Not Requested';
    return storageService.getStudentJoinStatus(activeOrUpcomingExam.id, studentId);
  }, [activeOrUpcomingExam, studentId, pollCount]);

  // Pending Classroom Invitations
  const pendingInvitations = useMemo(() => {
    if (!user?.username) return [];
    return storageService
      .getClassInvitations(user.username)
      .filter(inv => inv.status === 'Pending');
  }, [user, dataVersion, pollCount]);

  const handleAcceptInvitation = (invId: string) => {
    const res = storageService.respondToClassInvitation(invId, 'Accepted');
    refreshData();
    notify(res.message);
  };

  const handleDeclineInvitation = (invId: string) => {
    const res = storageService.respondToClassInvitation(invId, 'Declined');
    refreshData();
    notify(res.message);
  };

  const handleRequestJoin = (examId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    storageService.sendJoinRequest({
      examId,
      studentId: user?.studentId || '',
      studentName: user?.name || 'Student',
      studentUsername: user?.username || '',
      className: user?.classId || 'Unassigned'
    });
    refreshData();
    notify('Permission request sent to teacher! Waiting for approval.');
  };

  const handleEnterExam = (exam: typeof activeOrUpcomingExam, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!exam) return;
    setSelectedExamId(exam.id);
    setExamTitle(exam.title);

    const check = examService.canStudentEnterExam(exam.id, studentId);
    if (!check.allowed) {
      if (check.status === 'WaitingForStart') {
        go('Exam instructions'); // takes to briefing / waiting screen
        return;
      }
      notify(check.reason || 'Cannot enter examination.');
      return;
    }

    go('Main examination');
  };

  const handleCardClick = (exam: typeof activeOrUpcomingExam) => {
    if (!exam) return;
    setSelectedExamId(exam.id);
    setExamTitle(exam.title);

    const hasSubmitted = storageService.getSubmissions().some(
      s => s.examId === exam.id && (s.studentId === studentId || s.studentUsername === user?.username)
    );
    if (hasSubmitted) {
      const sub = storageService.getSubmissions().find(
        s => s.examId === exam.id && (s.studentId === studentId || s.studentUsername === user?.username)
      );
      if (sub?.resultsReleased) {
        go('Student result view');
      } else {
        go('Submission receipt');
      }
      return;
    }

    go('Exam instructions');
  };

  return (
    <>
      <div className="student-welcome">
        <div>
          <Badge tone="blue">STUDENT PORTAL</Badge>
          <h2>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}! 👋</h2>
          <p>
            {user?.enrollmentStatus === 'Pending' ? (
              <>Requested Section: <b>{user?.requestedClass || 'Class'}</b> <Badge tone="orange" style={{ fontSize: '10px', marginLeft: '6px' }}>Pending Approval</Badge> · Student ID: <b>{user?.studentId || 'N/A'}</b></>
            ) : (
              <>Enrolled in <b>{user?.className || user?.classId || 'Classroom'}</b> · Student ID: <b>{user?.studentId || 'N/A'}</b></>
            )}
          </p>
          {activeOrUpcomingExam && activeOrUpcomingExam.status === 'Active' && isEnrolledInActiveExam && (
            <Button onClick={(e) => handleEnterExam(activeOrUpcomingExam, e)}>
              Enter Live Examination <ArrowRight size={14} />
            </Button>
          )}
        </div>
        <div className="welcome-art">
          <div className="art-circle">
            <GraduationCap size={48} />
          </div>
          <Sparkles className="art-spark" size={24} />
        </div>
      </div>

      {/* Pending Class Enrollment Banner */}
      {user?.enrollmentStatus === 'Pending' && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#fde68a'
          }}
        >
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '10px', color: '#fbbf24', flexShrink: 0 }}>
            <Hourglass size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
              Class Enrollment Pending Teacher Approval
            </strong>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: '#fde68a' }}>
              Your enrollment request for <b>{user.requestedClass || 'your requested class'}</b> is currently under review by your teacher.
              Examinations assigned to this class will become accessible once your teacher approves your membership.
            </p>
          </div>
        </div>
      )}

      {/* Classroom Invitation Notifications */}
      {pendingInvitations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {pendingInvitations.map(inv => (
            <div
              key={inv.id}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.12) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#6366f1',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}
                >
                  <Users size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge tone="blue">CLASSROOM INVITATION</Badge>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                      From {inv.teacherName} (@{inv.teacherUsername})
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '16px', color: 'var(--text-primary, #fff)' }}>
                    Invitation to join <span style={{ color: '#818cf8', fontWeight: 700 }}>{inv.className}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
                    Confirm this invitation to enroll in {inv.className} and automatically gain access to all examinations assigned to this class.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button
                  kind="primary"
                  icon={Check}
                  onClick={() => handleAcceptInvitation(inv.id)}
                >
                  Confirm & Join Class
                </Button>
                <Button
                  kind="outline"
                  icon={X}
                  onClick={() => handleDeclineInvitation(inv.id)}
                >
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title">
        <div>
          <h2>Your assigned examinations</h2>
          <p>
            Showing the latest 5 examinations assigned for your grade level. Click any exam card to open.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeOrUpcomingExam && (
            <Badge tone={activeOrUpcomingExam.status === 'Active' ? 'green' : 'blue'}>
              {activeOrUpcomingExam.status === 'Active' ? '1 live session' : 'Upcoming session'}
            </Badge>
          )}
          {studentExams.length > 5 && (
            <Badge tone="gray">{studentExams.length} Total Exams</Badge>
          )}
        </div>
      </div>

      <div className="student-exam-grid">
        {displayedExams.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '36px',
              textAlign: 'center',
              background: 'var(--card-bg, #1e2433)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #2b354d)',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            No examinations currently scheduled for your grade level.
          </div>
        ) : (
          displayedExams.map(exam => {
            const student = storageService.getStudents().find(
              s => s.id === studentId || s.studentId === studentId || s.username === user?.username
            );
            const assignedClasses = (exam.assignedClassNames || []).filter(c => c && c !== 'Unassigned').map(c => c.toLowerCase());
            const isEnrolled = Boolean(student && (
              (student.className && assignedClasses.includes(student.className.toLowerCase())) ||
              (exam.className && student.className && exam.className.toLowerCase().includes(student.className.toLowerCase())) ||
              (exam.assignedStudentIds && (exam.assignedStudentIds.includes(student.id) || exam.assignedStudentIds.includes(student.studentId)))
            ));

            const hasSubmitted = storageService.getSubmissions().some(
              s => s.examId === exam.id && (s.studentId === studentId || s.studentUsername === user?.username)
            );

            return (
              <div
                key={exam.id}
                onClick={() => handleCardClick(exam)}
                className={`student-exam-card ${exam.status === 'Active' ? 'active-exam' : ''}`}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                title="Click to view examination details"
              >
                <div className="exam-card-top">
                  <Badge
                    tone={
                      hasSubmitted
                        ? 'gray'
                        : exam.status === 'Active'
                        ? (isEnrolled ? 'green' : 'orange')
                        : exam.status === 'Ready'
                        ? (isEnrolled ? 'purple' : 'blue')
                        : 'blue'
                    }
                  >
                    {hasSubmitted
                      ? 'Submitted'
                      : exam.status === 'Active'
                      ? (isEnrolled ? 'Live exam (Active)' : 'Live exam · Not invited')
                      : exam.status === 'Ready'
                      ? (isEnrolled ? 'Waiting for teacher start' : 'Published · Not invited')
                      : exam.status}
                  </Badge>
                  <div className={`exam-card-icon ${exam.status === 'Active' ? 'purple-bg' : 'blue-bg'}`}>
                    <BookOpen size={19} />
                  </div>
                </div>

                <h3><LatexText text={exam.title} /></h3>
                <p>
                  {exam.subject} <span>·</span> {exam.className} <span>·</span> {exam.code}
                </p>

                <div className="exam-meta">
                  <span>
                    <Clock3 size={14} /> {exam.duration}
                  </span>
                  <span>
                    <ListChecks size={14} /> {exam.questions.length} questions (Choose & T/F)
                  </span>
                  <span>
                    <CalendarDays size={14} /> {formatDisplayDate(exam.examDate)}
                  </span>
                </div>

                {/* Functional join permission and start controls */}
                <div style={{ marginTop: '14px' }} onClick={e => e.stopPropagation()}>
                  {hasSubmitted ? (
                    <Button
                      block
                      kind="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExamId(exam.id);
                        go('Submission receipt');
                      }}
                    >
                      View Submission Receipt <CheckCircle2 size={14} />
                    </Button>
                  ) : exam.status === 'Active' && isEnrolled ? (
                    <Button block onClick={(e) => handleEnterExam(exam, e)}>
                      Join Live Examination Now <ArrowRight size={14} />
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          padding: '10px',
                          background: isEnrolled ? 'rgba(52, 211, 153, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                          border: isEnrolled ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(234, 179, 8, 0.25)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: isEnrolled ? '#34d399' : '#eab308'
                        }}
                      >
                        {isEnrolled ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                        {isEnrolled
                          ? 'Enrolled by teacher · Waiting for official start...'
                          : 'Published by teacher · Waiting for invitation...'}
                      </div>
                      <Button
                        kind="outline"
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExamId(exam.id);
                          go('Exam instructions');
                        }}
                      >
                        View Exam Details <ArrowRight size={13} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
