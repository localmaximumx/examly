import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Clock3,
  Users,
  Wifi,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  UserX,
  Play,
  Hourglass,
  Check,
  ChevronDown,
  ChevronUp,
  XCircle,
  X,
  School,
  Plus,
  ArrowRight,
  ArrowLeft,
  History,
  BarChart3,
  Sparkles,
  Pencil,
  BookOpen,
  Pause,
  Trash2
} from 'lucide-react';
import { Button, Stat, Panel, Badge, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';
import { gradingService, isSameClass } from '../../services/grading.service';
import { wizardService } from '../../services/wizard.service';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';
import { Examination } from '../../types';

interface ActiveExamStudent {
  requestId: string;
  studentId: string;
  name: string;
  username: string;
  className: string;
  requestedAt: string;
  requestStatus: 'Pending' | 'Approved' | 'Rejected';
  submissionStatus: 'Submitted' | 'In progress' | 'Waiting in lobby';
  submittedAt?: string;
  score?: number;
}

export const LiveMonitoringScreen: React.FC = () => {
  const {
    notify,
    showConfirm,
    selectedExamId,
    setSelectedExamId,
    setSelectedClassId,
    setExamClassScope,
    setExamTitle,
    selectedSubmissionId,
    setSelectedSubmissionId,
    selectedCompletedClass,
    setSelectedCompletedClass,
    go,
    refreshData,
    dataVersion,
    user
  } = useApp();
  const [filter, setFilter] = useState('All');
  const [poll, setPoll] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [selectedClassToAssign, setSelectedClassToAssign] = useState('');

  // Poll every second to keep unified timer and join requests fresh
  useEffect(() => {
    const handleStorage = () => setPoll(p => p + 1);
    window.addEventListener('storage', handleStorage);
    const timer = setInterval(() => setPoll(p => p + 1), 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
    };
  }, []);

  const teacherUsername = user?.username || '';

  const teacherExams = useMemo(() => {
    return examService.getExamsForTeacher(teacherUsername);
  }, [teacherUsername, dataVersion, poll]);

  const fallbackExam: Examination = useMemo(() => ({
    id: '',
    code: '',
    title: 'No Examination',
    description: '',
    subject: '',
    classId: '',
    className: '',
    assignedClassNames: [],
    assignedStudentCount: 0,
    assignedStudentIds: [],
    examDate: '',
    startTime: '',
    duration: '0 min',
    durationMinutes: 0,
    totalMarks: 0,
    instructions: '',
    academicTerm: '',
    status: 'Ready',
    questions: [],
    createdAt: '',
    updatedAt: ''
  }), []);

  const activeTeacherExam = useMemo(() => {
    if (!teacherExams || teacherExams.length === 0) return null;
    return teacherExams.find(e => e.id === selectedExamId) || teacherExams[0];
  }, [selectedExamId, teacherExams]);

  const exam: Examination = activeTeacherExam || fallbackExam;

  // Synchronized unified timer
  const secondsRemaining = useMemo(() => {
    return exam.id ? storageService.getExamRemainingSeconds(exam.id) : 0;
  }, [exam.id, poll]);

  // Join Requests for this exact exam
  const joinRequests = useMemo(() => {
    return exam.id ? storageService.getJoinRequests(exam.id) : [];
  }, [exam.id, poll, dataVersion]);

  // Submissions for this exact exam
  const submissions = useMemo(() => {
    return exam.id ? storageService.getSubmissions().filter(s => s.examId === exam.id) : [];
  }, [exam.id, poll, dataVersion]);

  // Classes assigned to this specific examination
  const assignedClassesList = useMemo(() => {
    if (!exam) return [];
    const allClasses = storageService.getClasses();
    const allStudents = storageService.getStudents();
    const assignedNames = new Set<string>();

    if (exam.assignedClassNames && Array.isArray(exam.assignedClassNames)) {
      exam.assignedClassNames.forEach(c => {
        if (c && c !== 'Unassigned') assignedNames.add(c.toLowerCase());
      });
    }
    if (exam.className && exam.className !== 'Unassigned') {
      exam.className.split(',').forEach(c => {
        const t = c.trim();
        if (t && t !== 'Unassigned') assignedNames.add(t.toLowerCase());
      });
    }
    // Also include any classrooms that submitted for completed exams
    submissions.forEach(s => {
      if (s.className && s.className !== 'Unassigned') assignedNames.add(s.className.toLowerCase());
    });

    return allClasses
      .filter(c => assignedNames.has(c.name.toLowerCase()))
      .map(c => {
        const enrolledStudents = allStudents.filter(
          s => s.className && isSameClass(s.className, c.name)
        );
        const classSubmissions = submissions.filter(
          s => s.className && isSameClass(s.className, c.name)
        );
        const completedCount = classSubmissions.length;
        const inProgressCount = exam.status === 'Active'
          ? Math.max(0, enrolledStudents.length - completedCount)
          : 0;

        const gradedClassSubs = classSubmissions.filter(s => s.status === 'Graded' && typeof s.score === 'number');
        const avgScore = gradedClassSubs.length > 0
          ? Math.round(gradedClassSubs.reduce((acc, s) => acc + (s.score || 0), 0) / gradedClassSubs.length)
          : null;
        const passRate = gradedClassSubs.length > 0
          ? Math.round((gradedClassSubs.filter(s => (s.score || 0) >= ((s.maxScore || 100) * 0.5)).length / gradedClassSubs.length) * 100)
          : 0;

        return {
          id: c.id,
          name: c.name,
          academicYear: c.academicYear,
          teacherUsername: c.teacherUsername || teacherUsername,
          enrolledCount: enrolledStudents.length,
          takersCount: classSubmissions.length,
          completedCount,
          inProgressCount,
          avgScore,
          passRate,
          status: exam.status === 'Completed'
            ? 'Completed'
            : exam.status === 'Active'
            ? (completedCount === enrolledStudents.length && enrolledStudents.length > 0 ? 'All Completed' : 'In Progress')
            : 'Ready'
        };
      });
  }, [exam, submissions, teacherUsername, dataVersion, poll]);

  const totalEnrolledStudents = useMemo(() => {
    return assignedClassesList.reduce((acc, c) => acc + c.enrolledCount, 0);
  }, [assignedClassesList]);

  const availableClassesToAdd = useMemo(() => {
    const classes = storageService.getClasses();
    const assignedLower = assignedClassesList.map(c => c.name.toLowerCase());
    return classes.filter(c => !assignedLower.includes(c.name.toLowerCase()));
  }, [assignedClassesList, dataVersion, poll]);

  const handleAssignClass = () => {
    if (!selectedClassToAssign) {
      notify('Please select a classroom to assign.');
      return;
    }
    const updated = storageService.assignExamToClass(exam.id, selectedClassToAssign);
    if (updated) {
      notify(`Assigned "${selectedClassToAssign}" to "${exam.title}"!`);
      setSelectedClassToAssign('');
      setAddClassModalOpen(false);
      refreshData();
    }
  };

  // Performance calculations for completed exams
  const completedStats = useMemo(() => {
    const gradedList = submissions.filter(s => s.status === 'Graded' && s.score !== undefined);
    const totalGraded = gradedList.length;
    const awaitingGrading = submissions.length - totalGraded;

    let avgScore: number | null = null;
    let passRate = 0;
    if (totalGraded > 0) {
      avgScore = Math.round(gradedList.reduce((acc, s) => acc + (s.score || 0), 0) / totalGraded);
      passRate = Math.round(
        (gradedList.filter(s => (s.score || 0) >= ((s.maxScore || 100) * 0.5)).length / totalGraded) * 100
      );
    }

    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    gradedList.forEach(s => {
      const g = (s.grade || 'B') as keyof typeof counts;
      if (counts[g] !== undefined) counts[g]++;
    });

    const total = totalGraded || 1;
    const distribution = [
      { grade: 'A', percentage: Math.round((counts.A / total) * 100) },
      { grade: 'B', percentage: Math.round((counts.B / total) * 100) },
      { grade: 'C', percentage: Math.round((counts.C / total) * 100) },
      { grade: 'D', percentage: Math.round((counts.D / total) * 100) },
      { grade: 'F', percentage: Math.round((counts.F / total) * 100) }
    ];

    const areReleased = Boolean(
      exam.resultsReleased || (submissions.length > 0 && submissions.every(s => s.resultsReleased))
    );

    return {
      totalSubmissions: submissions.length,
      totalGraded,
      awaitingGrading,
      avgScore,
      passRate,
      distribution,
      areReleased
    };
  }, [submissions, exam]);

  // Scoped historical submissions for the selected completed class
  const classCompletedSubmissions = useMemo(() => {
    if (!selectedCompletedClass) return [];
    return submissions.filter(
      s => s.className && isSameClass(s.className, selectedCompletedClass)
    );
  }, [submissions, selectedCompletedClass]);

  const classCompletedStats = useMemo(() => {
    const graded = classCompletedSubmissions.filter(s => s.status === 'Graded' && typeof s.score === 'number');
    const total = graded.length;
    const avg = total > 0 ? Math.round(graded.reduce((acc, s) => acc + (s.score || 0), 0) / total) : null;
    const pass = total > 0 ? Math.round((graded.filter(s => (s.score || 0) >= ((s.maxScore || 100) * 0.5)).length / total) * 100) : 0;
    const highest = total > 0 ? Math.max(...graded.map(s => s.score || 0)) : 0;
    return { total, avg, pass, highest };
  }, [classCompletedSubmissions]);

  // Students who have sent request to join this exam
  const activeExamStudents = useMemo<ActiveExamStudent[]>(() => {
    return joinRequests.map(req => {
      const sub = submissions.find(
        s => s.studentId === req.studentId || s.studentUsername === req.studentUsername
      );
      const isSub = Boolean(sub);

      let submissionStatus: ActiveExamStudent['submissionStatus'] = 'Waiting in lobby';
      if (isSub) {
        submissionStatus = 'Submitted';
      } else if (req.status === 'Approved') {
        submissionStatus = 'In progress';
      }

      return {
        requestId: req.id,
        studentId: req.studentId,
        name: req.studentName,
        username: req.studentUsername,
        className: req.className,
        requestedAt: req.requestedAt,
        requestStatus: req.status,
        submissionStatus,
        submittedAt: sub?.submittedAt,
        score: sub?.score
      };
    });
  }, [joinRequests, submissions]);

  const pendingRequests = useMemo(() => {
    return activeExamStudents.filter(r => r.requestStatus === 'Pending');
  }, [activeExamStudents]);

  const approvedCount = useMemo(() => {
    return activeExamStudents.filter(r => r.requestStatus === 'Approved').length;
  }, [activeExamStudents]);

  const declinedCount = useMemo(() => {
    return activeExamStudents.filter(r => r.requestStatus === 'Rejected').length;
  }, [activeExamStudents]);

  const submittedCount = useMemo(() => {
    return activeExamStudents.filter(r => r.submissionStatus === 'Submitted').length;
  }, [activeExamStudents]);

  const filteredStudents = useMemo(() => {
    if (filter === 'All') return activeExamStudents;
    if (filter === 'Admitted') return activeExamStudents.filter(s => s.requestStatus === 'Approved');
    if (filter === 'Declined') return activeExamStudents.filter(s => s.requestStatus === 'Rejected');
    if (filter === 'Pending') return activeExamStudents.filter(s => s.requestStatus === 'Pending');
    if (filter === 'Submitted') return activeExamStudents.filter(s => s.submissionStatus === 'Submitted');
    return activeExamStudents;
  }, [activeExamStudents, filter]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatRequestTime = (val: string) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStartExam = () => {
    const res = examService.startOfficialExam(exam.id);
    if (res.success) {
      refreshData();
      notify(`"${exam.title}" is now LIVE! Official synchronized timer started.`);
      go('Live monitoring');
    } else {
      notify(res.message || 'Could not start examination.');
    }
  };

  const handleEditExam = () => {
    wizardService.loadExamToDraft(exam);
    setSelectedExamId(exam.id);
    setExamTitle(exam.title);
    notify(`Editing examination "${exam.title}".`);
    go('Create exam – general information');
  };

  const handleEndExam = () => {
    showConfirm({
      title: 'End Active Examination',
      message: `Are you sure you want to end "${exam.title}"? This will officially stop the synchronized countdown, finalize sessions, and switch to outcomes & results.`,
      type: 'warning',
      confirmText: 'End Session & Conclude',
      onConfirm: () => {
        examService.updateStatus(exam.id, 'Completed');
        refreshData();
        notify(`Examination "${exam.title}" has concluded. Showing official results.`);
        setSelectedExamId(exam.id);
        setExamTitle(exam.title);
        go('Results dashboard');
      }
    });
  };

  const handleApproveRequest = (requestId: string, studentName: string) => {
    storageService.approveJoinRequest(requestId);
    refreshData();
    notify(`Approved admission for ${studentName}.`);
  };

  const handleRejectRequest = (requestId: string, studentName: string) => {
    storageService.rejectJoinRequest(requestId);
    refreshData();
    notify(`Declined admission for ${studentName}.`);
  };

  const handleApproveAll = () => {
    const count = storageService.approveAllJoinRequests(exam.id);
    refreshData();
    notify(`Approved all ${count} pending student admission requests!`);
  };

  const handleExtendMinutes = (additionalMinutes: number) => {
    const res = examService.extendExamTime(exam.id, additionalMinutes);
    if (res.success) {
      refreshData();
      notify(`Added +${additionalMinutes} minutes to "${exam.title}". New duration: ${res.exam?.duration || ''}`);
    } else {
      notify(res.message);
    }
  };

  const handleTogglePause = () => {
    const res = examService.toggleExamPause(exam.id);
    if (res.success) {
      refreshData();
      if (res.isPaused) {
        notify(`⏸️ Examination timer PAUSED for "${exam.title}".`);
      } else {
        notify(`▶️ Examination timer RESUMED for "${exam.title}".`);
      }
    }
  };

  const handleRemoveClassFromExam = (className: string) => {
    showConfirm({
      title: 'Remove Class from Exam',
      message: `Are you sure you want to remove "${className}" from "${exam.title}"? Students enrolled in this classroom will no longer be authorized to take this examination.`,
      type: 'danger',
      confirmText: 'Remove Class',
      onConfirm: () => {
        const res = examService.removeClassFromExam(exam.id, className);
        if (res.success) {
          refreshData();
          notify(`Removed "${className}" from ${exam.title}.`);
        } else {
          notify(res.message);
        }
      }
    });
  };

  const handleGradeForEveryone = (targetClass?: string) => {
    const scopeClass = targetClass || selectedCompletedClass || undefined;
    const res = storageService.gradeAllSubmissionsForExam(exam.id, scopeClass);
    refreshData();
    notify(
      `Grading completed! Evaluated ${res.gradedCount} student submissions${scopeClass ? ` for ${scopeClass}` : ''}. Results are now released to students.`
    );
  };

  const handleExportCSV = (targetClass?: string) => {
    const scopeClass = targetClass || selectedCompletedClass || undefined;
    const csv = gradingService.exportResultsCSV(exam.id, scopeClass);
    const scopeLabel = scopeClass || exam.className;
    const filename = formatCSVFilename(exam.title, scopeLabel, 'Exam_Final_Results');
    downloadCSV(csv, filename);
    notify(`Exported outcomes for ${exam.title}${scopeClass ? ` (${scopeClass})` : ''} (${filename}).`);
  };

  const handleExportStatus = () => {
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    let dataList = activeExamStudents;
    if (dataList.length === 0) {
      const classStudents = storageService.getStudents().filter(st => st.className === exam.className);
      dataList = classStudents.map(st => ({
        requestId: `REQ-${st.id}`,
        studentId: st.studentId,
        name: st.name,
        username: st.username,
        className: st.className,
        requestedAt: '',
        requestStatus: 'Pending',
        submissionStatus: 'Waiting in lobby'
      }));
    }

    const headers = ['Student Name', 'Student ID', 'Class', 'Username', 'Examination', 'Admission Status', 'Exam Progress', 'Requested At'];
    const rows = dataList.map(s => [
      escapeCSV(s.name),
      escapeCSV(s.studentId),
      escapeCSV(s.className),
      escapeCSV(s.username),
      escapeCSV(exam.title),
      escapeCSV(s.requestStatus === 'Approved' ? 'Admitted' : s.requestStatus === 'Rejected' ? 'Declined' : 'Pending Approval'),
      escapeCSV(s.submissionStatus),
      escapeCSV(formatRequestTime(s.requestedAt))
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename(exam.title, exam.className, 'Live_Session_Roster');
    downloadCSV(csv, filename);
    notify(`Exported live session roster for ${exam.title} (${filename}).`);
  };

  if (!activeTeacherExam) {
    return (
      <div style={{ padding: '24px' }}>
        <Panel title="Live Proctoring & Monitoring">
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Clock3 size={48} style={{ opacity: 0.4, marginBottom: '16px', color: 'var(--accent-blue, #6366f1)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No examinations found for live monitoring
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 24px auto', fontSize: '14px', lineHeight: 1.5 }}>
              You do not currently have any examinations assigned to your account. Create an examination or start a session to begin live proctoring.
            </p>
            <Button kind="primary" onClick={() => go('Create exam – general information')}>
              Create Examination
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <>
      {/* Top Header: Exam Title, Details, and Header Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ flex: '1 1 360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: selectedCompletedClass ? '0' : '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #fff)', letterSpacing: '-0.5px' }}>
              {selectedCompletedClass
                ? `Students from ${selectedCompletedClass} who took this examination (${classCompletedSubmissions.length})`
                : <LatexText text={exam.title} />}
            </h1>
            {!selectedCompletedClass && (
              <Badge
                tone={
                  exam.status === 'Active'
                    ? 'green'
                    : exam.status === 'Completed'
                    ? 'purple'
                    : 'blue'
                }
              >
                {exam.status === 'Active'
                  ? '● LIVE MONITORING'
                  : exam.status === 'Completed'
                  ? 'COMPLETED'
                  : 'READY'}
              </Badge>
            )}
          </div>

          {!selectedCompletedClass && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary, #94a3b8)'
              }}
            >
              <span style={{ color: 'var(--accent-blue, #818cf8)', fontWeight: 600 }}>{exam.code}</span>
              <span>·</span>
              <span>{exam.subject}</span>
              <span>·</span>
              <span>Class: {exam.className}</span>
              <span>·</span>
              <span>Duration: {exam.duration}</span>
              <span>·</span>
              <span>{exam.questions.length} questions</span>
              <span>·</span>
              <span>
                {exam.status === 'Completed'
                  ? `${completedStats.totalSubmissions} submitted`
                  : exam.status === 'Active'
                  ? `${Math.max(0, totalEnrolledStudents - submissions.length)} active in session · ${submissions.length} submitted`
                  : `Assigned: ${totalEnrolledStudents} students`}
              </span>
            </div>
          )}
        </div>

        {/* Top Controls: Actions depend on Active / Completed / Scheduled */}
        {!selectedCompletedClass && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--card-bg, #1e2433)',
              border: '1px solid var(--border-color, #2b354d)'
            }}
          >
            {exam.status === 'Completed' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px' }}>
                <Badge tone={completedStats.areReleased ? 'green' : 'orange'}>
                  {completedStats.areReleased ? 'Results Released' : 'Awaiting Grading'}
                </Badge>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                  {completedStats.totalGraded} of {completedStats.totalSubmissions} Graded
                </span>
              </div>
            ) : (
            <>
              {/* Synchronized Timer Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: exam.status === 'Active' ? (exam.isPaused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.15)') : 'rgba(230, 160, 93, 0.15)',
                    color: exam.status === 'Active' ? (exam.isPaused ? '#f59e0b' : '#34d399') : '#e6a05d',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock3 size={14} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
                    <small style={{ display: 'block', fontSize: '9px', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                      {exam.status === 'Active' ? 'Time Remaining' : 'Official Duration'}
                    </small>
                    {exam.status === 'Active' && exam.isPaused && (
                      <Badge tone="orange" style={{ padding: '0px 4px', fontSize: '8px', fontWeight: 800, lineHeight: '12px' }}>
                        PAUSED
                      </Badge>
                    )}
                  </div>
                  <b style={{ fontSize: '13px', color: exam.isPaused ? '#f59e0b' : secondsRemaining <= 300 && exam.status === 'Active' ? '#ef4444' : 'var(--text-primary, #fff)', fontFamily: 'monospace', lineHeight: 1.2 }}>
                    {exam.status === 'Active' ? formatTimer(secondsRemaining) : exam.duration}
                  </b>
                </div>
              </div>

              {/* Add Extra Minutes & Pause / Resume Options (When exam is Active) */}
              {exam.status === 'Active' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color, #2b354d)' }}>
                  <Button
                    kind={exam.isPaused ? 'primary' : 'outline'}
                    icon={exam.isPaused ? Play : Pause}
                    onClick={handleTogglePause}
                    style={{
                      background: exam.isPaused ? '#f59e0b' : undefined,
                      borderColor: exam.isPaused ? '#f59e0b' : undefined,
                      color: exam.isPaused ? '#000' : undefined,
                      fontWeight: 700,
                      padding: '3px 8px',
                      fontSize: '11px',
                      height: '26px',
                      minHeight: 'unset'
                    }}
                  >
                    {exam.isPaused ? 'Resume Timer' : 'Pause Timer'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleExtendMinutes(10)}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '5px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'var(--bg-secondary, #151a26)',
                      border: '1px solid var(--border-color, #3b4661)',
                      color: 'var(--text-primary, #fff)',
                      cursor: 'pointer',
                      height: '26px'
                    }}
                    title="Add +10 minutes for all students"
                  >
                    +10m
                  </button>
                </div>
              )}

              {/* Session End, Start, or Edit Controls */}
              <div style={{ marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {exam.status !== 'Active' ? (
                  <>
                    <Button
                      icon={Pencil}
                      kind="outline"
                      onClick={handleEditExam}
                      style={{ padding: '3px 8px', fontSize: '11px', height: '26px', minHeight: 'unset' }}
                    >
                      Edit examination
                    </Button>
                    <Button
                      icon={Play}
                      onClick={handleStartExam}
                      style={{ padding: '3px 10px', fontSize: '11px', height: '26px', minHeight: 'unset' }}
                    >
                      Start Exam for Everyone
                    </Button>
                  </>
                ) : (
                  <Button
                    kind="danger"
                    onClick={handleEndExam}
                    style={{ padding: '3px 9px', fontSize: '11px', height: '26px', minHeight: 'unset' }}
                  >
                    End examination
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CASE 1: COMPLETED EXAM ➔ OFFICIAL OUTCOMES & CLASS HISTORY     */}
      {/* ============================================================== */}
      {exam.status === 'Completed' ? (
        selectedCompletedClass ? (
          /* ------------------------------------------------------------ */
          /* SUB-VIEW 1B: HISTORICAL CLASS EXAMINATION ROSTER             */
          /* Shows ONLY the students from that class who took this exam   */
          /* ------------------------------------------------------------ */
          <>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <Button
                kind="outline"
                icon={ArrowLeft}
                onClick={() => setSelectedCompletedClass(null)}
              >
                Back
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge tone="purple" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  <History size={13} style={{ verticalAlign: '-1px', marginRight: '6px' }} />
                  Historical Class Record · {selectedCompletedClass}
                </Badge>
              </div>
            </div>

            {/* 4 Performance Stat Cards scoped to this specific class */}
            <div className="stats-grid">
              <Stat
                label="Students evaluated"
                value={classCompletedStats.total}
                change={`From ${selectedCompletedClass}`}
                icon={UserCheck}
                tint="blue"
              />
              <Stat
                label="Class average score"
                value={classCompletedStats.avg !== null ? `${classCompletedStats.avg}%` : '—'}
                change={`${selectedCompletedClass} aggregate`}
                icon={BarChart3}
                tint="teal"
              />
              <Stat
                label="Class pass rate"
                value={`${classCompletedStats.pass}%`}
                change="Scores ≥ 50%"
                icon={CheckCircle2}
                tint="purple"
              />
              <Stat
                label="Highest score"
                value={classCompletedStats.total > 0 ? `${classCompletedStats.highest}%` : '—'}
                change={`Top mark in ${selectedCompletedClass}`}
                icon={Sparkles}
                tint="orange"
              />
            </div>

            {/* Student Submissions & Evaluation Table for this specific classroom */}
            <Panel
              title={`Students from ${selectedCompletedClass} who took this examination (${classCompletedSubmissions.length})`}
              subtitle={`Historical record of students who completed ${exam.title}. Any students added to ${selectedCompletedClass} after the exam was conducted are excluded from this historical log.`}
              action={
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    kind={completedStats.areReleased ? 'outline' : 'primary'}
                    icon={completedStats.areReleased ? Check : Sparkles}
                    onClick={() => handleGradeForEveryone(selectedCompletedClass)}
                  >
                    Regrade
                  </Button>
                  <Button icon={Download} kind="outline" onClick={() => handleExportCSV(selectedCompletedClass)}>
                    Export (CSV)
                  </Button>
                </div>
              }
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>STUDENT ID</th>
                      <th>SUBMITTED AT</th>
                      <th>SCORE</th>
                      <th>GRADE</th>
                      <th>STATUS</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {classCompletedSubmissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: 'var(--text-secondary, #94a3b8)'
                          }}
                        >
                          No students from {selectedCompletedClass} took this examination.
                        </td>
                      </tr>
                    ) : (
                      classCompletedSubmissions.map(sub => (
                        <tr key={sub.id}>
                          <td>
                            <b>{sub.studentName}</b>
                            <small>@{sub.studentUsername}</small>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sub.studentId}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                              {sub.submittedAt || 'Completed'}
                            </span>
                          </td>
                          <td>
                            <b>{sub.score !== undefined ? `${sub.score}/${sub.maxScore || 100}` : '—'}</b>
                            {sub.percentage !== undefined && (
                              <small style={{ color: 'var(--text-secondary, #94a3b8)', marginLeft: '4px' }}>
                                ({sub.percentage}%)
                              </small>
                            )}
                          </td>
                          <td>
                            <Badge
                              tone={
                                sub.grade === 'A'
                                  ? 'green'
                                  : sub.grade === 'B'
                                  ? 'blue'
                                  : sub.grade === 'C'
                                  ? 'blue'
                                  : 'gray'
                              }
                            >
                              Grade {sub.grade || '—'}
                            </Badge>
                          </td>
                          <td>
                            <Badge tone={sub.status === 'Graded' ? 'green' : 'orange'}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td>
                            <button
                              className="text-link"
                              onClick={() => {
                                setSelectedSubmissionId(sub.id);
                                go('Individual result & grading');
                              }}
                            >
                              Review <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        ) : (
          /* ------------------------------------------------------------ */
          /* SUB-VIEW 1A: COMPLETED EXAM OVERVIEW & CLASSES THAT TOOK IT  */
          /* Displays the classrooms that completed this exam             */
          /* ------------------------------------------------------------ */
          <>
            {/* 4 Performance Stat Cards */}
            <div className="stats-grid">
              <Stat
                label="Participating classrooms"
                value={assignedClassesList.length}
                change="Took this exam"
                icon={School}
                tint="blue"
              />
              <Stat
                label="Students evaluated"
                value={completedStats.totalGraded}
                change="All submissions"
                icon={UserCheck}
                tint="teal"
              />
              <Stat
                label="Overall average score"
                value={completedStats.avgScore !== null ? `${completedStats.avgScore}%` : '—'}
                change="School aggregate"
                icon={BarChart3}
                tint="purple"
              />
              <Stat
                label="Overall pass rate"
                value={`${completedStats.passRate}%`}
                change="Scores ≥ 50%"
                icon={CheckCircle2}
                tint="orange"
              />
            </div>

            {/* Grade Distribution & Performance Summary side-by-side */}
            <div className="dashboard-grid">
              <Panel
                title="Overall grade distribution"
                subtitle={`${exam.title} · Across all classes`}
              >
                <div className="grade-bars">
                  {completedStats.distribution.map(d => (
                    <div className="grade-bar-row" key={d.grade}>
                      <b>Grade {d.grade}</b>
                      <div>
                        <i style={{ width: `${d.percentage}%` }} />
                      </div>
                      <small>{d.percentage}%</small>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Performance summary" subtitle="School benchmark evaluation">
                <div className="result-score">
                  <b>{completedStats.avgScore !== null ? `${completedStats.avgScore}%` : '—'}</b>
                  <Badge tone={(completedStats.avgScore || 0) >= 50 ? 'green' : 'orange'}>
                    {(completedStats.avgScore || 0) >= 50 ? 'Passing benchmark' : 'Requires review'}
                  </Badge>
                </div>
                <p className="muted" style={{ padding: '0 20px' }}>
                  Calculated across {completedStats.totalGraded} evaluated student submissions for {exam.title}.
                  {completedStats.awaitingGrading > 0 && (
                    <span style={{ display: 'block', marginTop: '6px', color: '#e6a05d' }}>
                      ⚠️ {completedStats.awaitingGrading} submissions are awaiting your evaluation. Click "Grade for Everyone" above.
                    </span>
                  )}
                </p>
                <div style={{ padding: '16px 20px' }}>
                  <Button
                    kind="outline"
                    onClick={() => {
                      if (submissions.length > 0) {
                        setSelectedSubmissionId(submissions[0].id);
                      }
                      go('Individual result & grading');
                    }}
                  >
                    Review individual responses <ArrowRight size={14} />
                  </Button>
                </div>
              </Panel>
            </div>

            {/* Primary Panel: Classrooms that took this Examination */}
            <Panel
              title={`Classrooms that took this examination (${assignedClassesList.length})`}
              subtitle="Select any classroom below to view its historical student roster and individual scores for this examination."
              action={
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    kind={completedStats.areReleased ? 'outline' : 'primary'}
                    icon={completedStats.areReleased ? Check : Sparkles}
                    onClick={() => handleGradeForEveryone()}
                  >
                    Regrade
                  </Button>
                  <Button icon={Download} kind="outline" onClick={() => handleExportCSV()}>
                    Export (CSV)
                  </Button>
                </div>
              }
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CLASSROOM</th>
                      <th>ACADEMIC YEAR</th>
                      <th>EXAM TAKERS</th>
                      <th>CLASS AVERAGE</th>
                      <th>PASS RATE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedClassesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary, #94a3b8)' }}>
                          No classrooms recorded for this completed examination.
                        </td>
                      </tr>
                    ) : (
                      assignedClassesList.map(c => (
                        <tr
                          key={c.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedCompletedClass(c.name)}
                          title={`Click to view students from ${c.name} who took this exam`}
                        >
                          <td>
                            <b>{c.name}</b>
                            <small>Managed by @{c.teacherUsername}</small>
                          </td>
                          <td>{c.academicYear}</td>
                          <td>
                            <Badge tone="blue">
                              <Users size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                              {c.takersCount} Students Took Exam
                            </Badge>
                          </td>
                          <td>
                            <b style={{ color: c.avgScore && c.avgScore >= 50 ? '#34d399' : '#e6a05d' }}>
                              {c.avgScore !== null ? `${c.avgScore}%` : '—'}
                            </b>
                          </td>
                          <td>
                            <b>{c.passRate}%</b>
                          </td>
                          <td>
                            <Badge tone="purple">
                              Completed
                            </Badge>
                          </td>
                          <td>
                            <Button
                              kind="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompletedClass(c.name);
                              }}
                            >
                              View Class History <ArrowRight size={13} style={{ marginLeft: '4px', verticalAlign: '-1px' }} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )
      ) : (
        /* ============================================================== */
        /* CASE 2: ACTIVE OR SCHEDULED EXAM ➔ LIVE LOBBY & MONITORING     */
        /* ============================================================== */
        <>
          {/* Dynamic Stats Grid for Classes and Cohort Assigned to this Exam */}
          <div className="stats-grid compact-stats">
            <Stat
              label="Assigned Classes"
              value={assignedClassesList.length}
              change={assignedClassesList.map(c => c.name).join(', ') || 'None assigned'}
              icon={BookOpen}
              tint="blue"
            />
            <Stat
              label="Total Enrolled Cohort"
              value={totalEnrolledStudents}
              change="Across all assigned classes"
              icon={Users}
              tint="teal"
            />
            <Stat
              label="Active In-Session"
              value={exam.status === 'Active' ? Math.max(0, totalEnrolledStudents - submissions.length) : 0}
              change={
                exam.status === 'Active'
                  ? `${Math.max(0, totalEnrolledStudents - submissions.length)} taking assessment`
                  : 'Session not started'
              }
              icon={Wifi}
              tint="orange"
            />
            <Stat
              label="Completed Submissions"
              value={submissions.length}
              change={
                totalEnrolledStudents > 0
                  ? `${submissions.length} of ${totalEnrolledStudents} submitted (${Math.round((submissions.length / totalEnrolledStudents) * 100)}%)`
                  : '0 submitted'
              }
              icon={CheckCircle2}
              tint="purple"
            />
          </div>

          {/* Classes Assigned to this Examination */}
          <Panel
            title={`Classes assigned to this examination (${assignedClassesList.length})`}
            subtitle="All students in these classrooms are enrolled and authorized to take this examination"
            action={
              <Button
                kind="primary"
                icon={Plus}
                onClick={() => setAddClassModalOpen(true)}
              >
                Add a class
              </Button>
            }
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>CLASSROOM</th>
                    <th>ACADEMIC YEAR</th>
                    <th>ENROLLED STUDENTS</th>
                    <th>SESSION STATUS</th>
                    <th>SUBMISSIONS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedClassesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary, #94a3b8)' }}>
                        <BookOpen size={24} color="#818cf8" style={{ display: 'block', margin: '0 auto 8px' }} />
                        <b>No classes currently assigned to this examination</b>
                        <p style={{ margin: '4px 0 16px 0', fontSize: '13px' }}>
                          Assign this examination to one or more classrooms to enroll their students.
                        </p>
                        <Button kind="primary" icon={Plus} onClick={() => setAddClassModalOpen(true)}>
                          Add a class now
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    assignedClassesList.map(c => (
                      <tr key={c.id}>
                        <td>
                          <b>{c.name}</b>
                          <small>Managed by @{c.teacherUsername}</small>
                        </td>
                        <td>{c.academicYear}</td>
                        <td>
                          <Badge tone="blue">
                            <Users size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                            {c.enrolledCount} Students Enrolled
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            tone={
                              c.status === 'In Progress'
                                ? 'green'
                                : c.status === 'All Completed' || c.status === 'Concluded'
                                ? 'purple'
                                : 'blue'
                            }
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td>
                          <b>{c.completedCount}/{c.enrolledCount}</b> submitted
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {exam.status === 'Completed' ? (
                              <button
                                className="text-link"
                                onClick={() => {
                                  setSelectedCompletedClass(c.name);
                                }}
                              >
                                View Class Outcomes <ArrowRight size={13} />
                              </button>
                            ) : (
                              <>
                                <button
                                  className="text-link"
                                  onClick={() => {
                                    setSelectedClassId(c.id);
                                    go('Class detail');
                                  }}
                                >
                                  Manage Classroom <ArrowRight size={13} />
                                </button>
                                <button
                                  className="icon-btn"
                                  title={`Remove ${c.name} from this exam`}
                                  style={{
                                    color: '#ef4444',
                                    padding: '5px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveClassFromExam(c.name);
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* ============================================================== */}
      {/* AUTHORED QUESTIONS CARD (MONITORING SECTION ONLY)             */}
      {/* ============================================================== */}
      {exam.status !== 'Completed' && (
        <div style={{ marginTop: '20px' }}>
          <Panel
            title={`Questions in this Exam (${exam.questions.length})`}
            subtitle="Authored Multiple Choice and True/False questions with answer keys"
            action={
              <Button
                kind="outline"
                icon={showQuestions ? ChevronUp : ChevronDown}
                onClick={() => setShowQuestions(prev => !prev)}
              >
                {showQuestions ? 'Hide questions' : 'Show questions'}
              </Button>
            }
          >
            {showQuestions && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {exam.questions.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>No questions added to this examination.</p>
                ) : (
                  exam.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary, rgba(0,0,0,0.2))',
                        border: '1px solid var(--border-color, #2b354d)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6577e8' }}>
                          Question {idx + 1} · {q.type} · {q.marks} marks
                        </span>
                        {q.correctAnswer && <Badge tone="green">Key: {q.correctAnswer}</Badge>}
                      </div>
                      <p style={{ margin: '6px 0', fontWeight: 600 }}>
                        <LatexText text={q.text} />
                      </p>
                      {q.options && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {q.options.map(opt => (
                            <span
                              key={opt.id}
                              style={{
                                fontSize: '12px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: opt.id === q.correctAnswer ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                                border:
                                  opt.id === q.correctAnswer
                                    ? '1px solid rgba(52, 211, 153, 0.4)'
                                    : '1px solid var(--border-color, #2b354d)'
                              }}
                            >
                              <b>{opt.id}:</b> <LatexText text={opt.text} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </Panel>
        </div>
      )}

      <p className="muted footnote" style={{ marginTop: '16px' }}>
        <ShieldCheck size={14} /> Official synchronized examination and assessment outcomes console.
      </p>

      {/* Add Classroom to Exam Modal */}
      {addClassModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: '20px'
          }}
          onClick={() => setAddClassModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '14px',
              background: 'var(--card-bg, #1e2433)',
              border: '1px solid var(--border-color, #2b354d)',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <School size={20} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  Assign Classroom to Exam
                </h3>
              </div>
              <button
                className="icon-btn"
                onClick={() => setAddClassModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 18px 0' }}>
              Assign <b>{exam.title}</b> to an additional classroom. All students enrolled in that class will automatically gain authorization.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Select Classroom ({availableClassesToAdd.length} available)
              </label>
              {availableClassesToAdd.length === 0 ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    fontSize: '13px',
                    color: '#34d399'
                  }}
                >
                  ✓ All existing school classrooms are already assigned to this examination.
                </div>
              ) : (
                <select
                  className="field"
                  style={{ margin: 0, width: '100%' }}
                  value={selectedClassToAssign}
                  onChange={e => setSelectedClassToAssign(e.target.value)}
                >
                  <option value="">Choose a classroom to assign...</option>
                  {availableClassesToAdd.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.academicYear} · {c.studentCount} students)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button kind="outline" onClick={() => setAddClassModalOpen(false)}>
                Cancel
              </Button>
              <Button
                kind="primary"
                disabled={!selectedClassToAssign}
                onClick={handleAssignClass}
              >
                Assign Classroom
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
