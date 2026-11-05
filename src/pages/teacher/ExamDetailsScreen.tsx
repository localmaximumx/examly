import React, { useMemo, useState } from 'react';
import {
  Pencil,
  BookOpen,
  Users,
  ArrowRight,
  Activity,
  Check,
  UserCheck,
  CheckCircle2,
  BarChart3,
  Download,
  Clock3,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  School,
  Trash2
} from 'lucide-react';
import { PageHeading, Button, Badge, Panel, Stat, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { storageService } from '../../services/storage.service';
import { gradingService, isSameClass } from '../../services/grading.service';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';
import { formatDisplayDate } from '../../utils/date.utils';

export const ExamDetailsScreen: React.FC = () => {
  const {
    go,
    user,
    selectedExamId,
    setSelectedExamId,
    setExamTitle,
    examClassScope,
    setExamClassScope,
    setSelectedClassId,
    dataVersion,
    refreshData,
    notify,
    showConfirm
  } = useApp();
  const [showQuestions, setShowQuestions] = useState(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [selectedClassToAssign, setSelectedClassToAssign] = useState('');

  const exam = useMemo(() => {
    return examService.getExamById(selectedExamId) || examService.getAllExams()[0];
  }, [selectedExamId, dataVersion]);

  // All classes assigned to this examination
  const allAssignedClasses = useMemo(() => {
    const list: string[] = [];
    if (exam.assignedClassNames && Array.isArray(exam.assignedClassNames)) {
      exam.assignedClassNames.forEach(c => {
        if (c && c !== 'Unassigned' && !list.includes(c)) list.push(c);
      });
    }
    if (exam.className && exam.className !== 'Unassigned') {
      exam.className.split(',').forEach(c => {
        const t = c.trim();
        if (t && t !== 'Unassigned' && !list.includes(t)) list.push(t);
      });
    }
    return list;
  }, [exam]);

  // Active filter: if examClassScope matches an assigned class, filter specifically to that class; otherwise Comprehensive
  const activeScope = useMemo(() => {
    if (examClassScope && allAssignedClasses.some(c => isSameClass(c, examClassScope))) {
      return examClassScope;
    }
    return null; // Comprehensive (all classes)
  }, [examClassScope, allAssignedClasses]);

  // Classes assigned with metadata
  const assignedClassesList = useMemo(() => {
    const classes = storageService.getClasses();
    const students = storageService.getStudents();
    const allSubs = storageService.getSubmissions().filter(s => s.examId === exam.id);

    return allAssignedClasses.map(clsName => {
      const clsObj = classes.find(c => c.name.toLowerCase() === clsName.toLowerCase());
      const classStudents = students.filter(
        s => s.className && s.className.toLowerCase() === clsName.toLowerCase()
      );
      const classSubs = allSubs.filter(
        s => s.className && s.className.toLowerCase() === clsName.toLowerCase()
      );

      let status = 'Ready for exam';
      if (exam.status === 'Completed') {
        status = 'Completed';
      } else if (exam.status === 'Active') {
        status = 'In session';
      }

      return {
        id: clsObj?.id || clsName,
        name: clsName,
        academicYear: clsObj?.academicYear || '2026/2027',
        teacherUsername: clsObj?.teacherUsername || exam.teacherUsername || user?.username || '',
        enrolledCount: classStudents.length,
        submissionsCount: classSubs.length,
        status
      };
    });
  }, [allAssignedClasses, exam, dataVersion, user]);

  // Available school classes not yet assigned to this exam
  const availableClassesToAdd = useMemo(() => {
    const classes = storageService.getClasses();
    const assignedLower = allAssignedClasses.map(c => c.toLowerCase());
    return classes.filter(c => !assignedLower.includes(c.name.toLowerCase()));
  }, [allAssignedClasses, dataVersion]);

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

  // All students enrolled in this exam across all assigned classes
  const enrolledStudents = useMemo(() => {
    if ((!exam.className || exam.className === 'Unassigned') && allAssignedClasses.length === 0) return [];
    const lowerAssigned = allAssignedClasses.map(c => c.toLowerCase());
    return storageService.getStudents().filter(s => {
      if (s.className && lowerAssigned.includes(s.className.toLowerCase())) {
        return true;
      }
      if (exam.assignedStudentIds && (exam.assignedStudentIds.includes(s.id) || exam.assignedStudentIds.includes(s.studentId))) {
        return true;
      }
      return false;
    });
  }, [exam, allAssignedClasses, dataVersion]);

  // Scoped enrolled students (filtered to active class scope if set)
  const scopedEnrolledStudents = useMemo(() => {
    if (!activeScope) return enrolledStudents;
    return enrolledStudents.filter(s => s.className && isSameClass(s.className, activeScope));
  }, [enrolledStudents, activeScope]);

  // Real Submissions for this exam
  const submissions = useMemo(() => {
    return storageService.getSubmissions().filter(s => s.examId === exam.id);
  }, [exam.id, dataVersion]);

  // Scoped Submissions (filtered to active class scope if set)
  const scopedSubmissions = useMemo(() => {
    if (!activeScope) return submissions;
    return submissions.filter(s => s.className && isSameClass(s.className, activeScope));
  }, [submissions, activeScope]);

  // Unified evaluation roster for completed exams (combining enrolled students cohort and actual submissions)
  const completedRoster = useMemo(() => {
    const list: Array<{
      id: string;
      studentId: string;
      name: string;
      username: string;
      className: string;
      sub?: typeof submissions[0];
    }> = [];

    const matchedSubIds = new Set<string>();

    // 1. All enrolled students in class cohort
    enrolledStudents.forEach(st => {
      const sub = submissions.find(
        s => s.studentId === st.studentId || s.studentUsername === st.username || s.studentId === st.id
      );
      if (sub) matchedSubIds.add(sub.id);
      list.push({
        id: st.id || st.studentId,
        studentId: st.studentId,
        name: st.name,
        username: st.username,
        className: st.className,
        sub
      });
    });

    // 2. Any additional submissions (e.g. transfer/guest students)
    submissions.forEach(sub => {
      if (!matchedSubIds.has(sub.id)) {
        list.push({
          id: sub.id,
          studentId: sub.studentId,
          name: sub.studentName,
          username: sub.studentUsername,
          className: sub.className || exam.className,
          sub
        });
      }
    });

    return list;
  }, [enrolledStudents, submissions, exam.className]);

  // Scoped completed roster
  const scopedCompletedRoster = useMemo(() => {
    if (!activeScope) return completedRoster;
    return completedRoster.filter(r => r.className && isSameClass(r.className, activeScope));
  }, [completedRoster, activeScope]);

  // Performance calculations for completed exams (scoped to active class or comprehensive across all)
  const completedStats = useMemo(() => {
    const gradedList = scopedSubmissions.filter(s => s.status === 'Graded' && s.score !== undefined);
    const totalGraded = gradedList.length;
    const awaitingGrading = scopedSubmissions.length - totalGraded;

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
      exam.resultsReleased || (scopedSubmissions.length > 0 && scopedSubmissions.every(s => s.resultsReleased))
    );

    return {
      totalSubmissions: scopedSubmissions.length,
      totalGraded,
      awaitingGrading,
      avgScore,
      passRate,
      distribution,
      areReleased
    };
  }, [scopedSubmissions, exam]);

  const handleGradeForEveryone = () => {
    const res = storageService.gradeAllSubmissionsForExam(exam.id, activeScope || undefined);
    refreshData();
    notify(
      `Grading completed! Evaluated ${res.gradedCount} student submissions${activeScope ? ` for ${activeScope}` : ''}. Results are now released to students.`
    );
  };

  const handleExportCSV = () => {
    const csv = gradingService.exportResultsCSV(exam.id, activeScope || undefined);
    const scopeLabel = activeScope || (allAssignedClasses.length > 0 ? allAssignedClasses.join('_') : exam.className);
    const filename = formatCSVFilename(exam.title, scopeLabel, 'Exam_Student_Roster');
    downloadCSV(csv, filename);
    notify(`Exported outcomes for ${exam.title}${activeScope ? ` (${activeScope})` : ' (Comprehensive - All Classes)'} (${filename}).`);
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

  const lifecycleStages = ['Ready', 'Active', 'Completed'];
  const currentStageIndex = lifecycleStages.indexOf(exam.status);

  return (
    <>
      <PageHeading
        title={exam.status === 'Completed' ? 'Examination data & outcomes' : 'Examination details'}
        desc={
          activeScope
            ? `Viewing examination data scoped exclusively to ${activeScope}.`
            : exam.status === 'Completed'
            ? 'Comprehensive examination records and student evaluations across all assigned classes.'
            : 'Comprehensive examination setup and enrolled student cohorts across all assigned classes.'
        }
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            {exam.status === 'Active' ? (
              <Button icon={Activity} onClick={() => go('Live monitoring')}>
                Open Live Monitoring
              </Button>
            ) : exam.status === 'Completed' ? (
              <>
                <Button
                  kind={completedStats.areReleased ? 'outline' : 'primary'}
                  icon={completedStats.areReleased ? Check : Sparkles}
                  onClick={handleGradeForEveryone}
                >
                  Regrade
                </Button>
                <Button icon={Download} kind="outline" onClick={handleExportCSV}>
                  Export (CSV)
                </Button>
              </>
            ) : (
              <Button
                icon={Pencil}
                kind="outline"
                onClick={() => go('Create exam – general information')}
              >
                Edit examination
              </Button>
            )}
          </div>
        }
      />

      {/* Class Scope Switcher: Allows viewing specific class or comprehensive all-classes data */}
      {allAssignedClasses.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            borderRadius: '10px',
            background: 'var(--card-bg, #1e2433)',
            border: '1px solid var(--border-color, #2b354d)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
              Class View Scope:
            </span>
            <div className="tabs" style={{ margin: 0 }}>
              <button
                className={`tab ${!activeScope ? 'active' : ''}`}
                onClick={() => setExamClassScope(null)}
              >
                All Classes (Comprehensive · {enrolledStudents.length} students)
              </button>
              {allAssignedClasses.map(clsName => {
                const count = enrolledStudents.filter(s => s.className.toLowerCase() === clsName.toLowerCase()).length;
                return (
                  <button
                    key={clsName}
                    className={`tab ${activeScope === clsName ? 'active' : ''}`}
                    onClick={() => setExamClassScope(clsName)}
                  >
                    {clsName} ({count})
                  </button>
                );
              })}
            </div>
          </div>
          {activeScope ? (
            <Badge tone="purple">
              Scoped to {activeScope} only
            </Badge>
          ) : (
            <Badge tone="blue">
              Comprehensive ({allAssignedClasses.length} {allAssignedClasses.length === 1 ? 'Class' : 'Classes'})
            </Badge>
          )}
        </div>
      )}

      {/* Live Notice Banner if exam is currently active */}
      {exam.status === 'Active' && (
        <div
          style={{
            padding: '14px 18px',
            marginBottom: '18px',
            borderRadius: '9px',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#34d399" />
            <div>
              <b style={{ color: '#34d399' }}>This examination is currently LIVE!</b>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
                Students are actively connected with the synchronized official timer.
              </p>
            </div>
          </div>
          <Button onClick={() => go('Live monitoring')}>
            Enter Live Monitoring <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {/* Main Details and Side lifecycle panel */}
      <div
        className="detail-grid"
        style={{ gridTemplateColumns: exam.status === 'Completed' ? '1fr' : undefined }}
      >
        <div className="panel detail-main">
          <div className="detail-title" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div className="detail-icon">
              <BookOpen size={23} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}><LatexText text={exam.title} /></h2>
                <Badge
                  tone={
                    exam.status === 'Active'
                      ? 'green'
                      : exam.status === 'Completed'
                      ? 'purple'
                      : 'blue'
                  }
                >
                  {exam.status}
                </Badge>
              </div>
              <p style={{ margin: '6px 0 0' }}>
                {exam.code} · {exam.subject} · {exam.className && exam.className !== 'Unassigned' ? exam.className : 'Unassigned'} · Created by {exam.teacherName || 'Faculty'}
              </p>
            </div>
          </div>

          <div className="detail-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
            <div>
              <small>Duration</small>
              <b>{exam.duration}</b>
            </div>
            <div>
              <small>Scheduled date</small>
              <b>{formatDisplayDate(exam.examDate)}</b>
            </div>
            <div>
              <small>Start time</small>
              <b>{exam.startTime || '09:00 AM'}</b>
            </div>
            <div>
              <small>Total marks</small>
              <b>{exam.totalMarks} marks</b>
            </div>
            <div>
              <small>{exam.status === 'Completed' ? 'Submissions' : 'Assigned cohort'}</small>
              <b>
                {exam.status === 'Completed'
                  ? `${completedStats.totalSubmissions} submitted`
                  : `${scopedEnrolledStudents.length} students enrolled`}
              </b>
            </div>
            <div>
              <small>Questions</small>
              <b>{exam.questions.length} questions</b>
            </div>
          </div>

          <h3>Examination instructions</h3>
          <p className="muted" style={{ marginBottom: '24px' }}>{exam.instructions}</p>

          {exam.status !== 'Completed' && (
            <div className="detail-actions">
              <Button kind="outline" onClick={() => go('Exam preview')}>
                Preview as Student
              </Button>
              {exam.status === 'Active' ? (
                <Button onClick={() => go('Live monitoring')}>
                  Monitor Live Session <Activity size={15} />
                </Button>
              ) : (
                <Button onClick={() => go('Start examination confirmation')}>
                  Prepare to start <ArrowRight size={15} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Exam lifecycle card ONLY displayed if NOT completed */}
        {exam.status !== 'Completed' && (
          <div className="panel detail-side">
            <h3>Exam lifecycle</h3>
            {lifecycleStages.map((s, i) => (
              <div
                className={`lifecycle ${
                  i === (currentStageIndex >= 0 ? currentStageIndex : 0) ? 'current' : ''
                }`}
                key={s}
              >
                <span>{i + 1}</span>
                <div>
                  <b>{s}</b>
                  <small>
                    {
                      [
                        'You can still edit this examination',
                        'Visible to assigned students',
                        'Waiting for teacher to start',
                        'Students are taking the exam',
                        'Submissions are closed'
                      ][i]
                    }
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classes Assigned to this Examination */}
      <Panel
        title={`Classes assigned to this examination (${assignedClassesList.length})`}
        subtitle={
          exam.status === 'Completed'
            ? 'Classrooms that completed this examination. Click any class to view its specific performance breakdown.'
            : 'All students in these classrooms are enrolled and authorized to take this examination.'
        }
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
                <th>ENROLLED COHORT</th>
                <th>STATUS</th>
                <th>SUBMISSIONS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {assignedClassesList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary, #94a3b8)' }}>
                    <BookOpen size={26} color="#818cf8" style={{ display: 'block', margin: '0 auto 8px' }} />
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
                          c.status === 'In session'
                            ? 'green'
                            : c.status === 'Completed'
                            ? 'purple'
                            : 'blue'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td>
                      <b>{c.submissionsCount}/{c.enrolledCount}</b> submitted
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {exam.status === 'Completed' ? (
                          <button
                            className="text-link"
                            onClick={() => {
                              setExamClassScope(c.name);
                              const el = document.getElementById('completed-performance-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            View Class Outcomes <ArrowRight size={13} />
                          </button>
                        ) : (
                          <>
                            <button
                              className="text-link"
                              onClick={() => {
                                const targetClass = storageService.getClasses().find(cls => cls.name.toLowerCase() === c.name.toLowerCase());
                                if (targetClass) setSelectedClassId(targetClass.id);
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

      {/* Enrolled Students Cohort for this Assigned Examination */}
      {exam.status !== 'Completed' && (exam.className && exam.className !== 'Unassigned' || allAssignedClasses.length > 0) && (
        <Panel
          title={`Enrolled Students Cohort (${scopedEnrolledStudents.length} Students)`}
          subtitle={`All registered students in ${activeScope || (allAssignedClasses.length > 0 ? allAssignedClasses.join(', ') : exam.className)} eligible to take this examination`}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>STUDENT ID</th>
                  <th>USERNAME</th>
                  <th>CLASS</th>
                  <th>SESSION STATUS</th>
                </tr>
              </thead>
              <tbody>
                {scopedEnrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary, #94a3b8)' }}>
                      No students currently enrolled in {activeScope || exam.className}.
                    </td>
                  </tr>
                ) : (
                  scopedEnrolledStudents.map(s => {
                    const hasSubmitted = submissions.some(sub => sub.studentId === s.studentId || sub.studentUsername === s.username);
                    return (
                      <tr key={s.id || s.studentId}>
                        <td>
                          <b>{s.name}</b>
                        </td>
                        <td>{s.studentId}</td>
                        <td>@{s.username}</td>
                        <td>
                          <Badge tone="blue">{s.className}</Badge>
                        </td>
                        <td>
                          {hasSubmitted ? (
                            <Badge tone="green">
                              <CheckCircle2 size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                              Submitted
                            </Badge>
                          ) : (
                            <Badge tone="blue">
                              <CheckCircle2 size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                              Enrolled in Class
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* For Non-Completed Exams: Questions List */}
      {exam.status !== 'Completed' && (
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
      )}

      {/* If Completed: Results & Performance Section at the Bottom */}
      {exam.status === 'Completed' && (
        <div id="completed-performance-section" style={{ marginTop: '24px' }}>
          {/* 4 Stat Cards */}
          <div className="stats-grid">
            <Stat
              label="Students graded"
              value={completedStats.totalGraded}
              change="Evaluated"
              icon={UserCheck}
              tint="blue"
            />
            <Stat
              label="Average score"
              value={completedStats.avgScore !== null ? `${completedStats.avgScore}%` : '—'}
              change="Class aggregate"
              icon={BarChart3}
              tint="teal"
            />
            <Stat
              label="Pass rate"
              value={`${completedStats.passRate}%`}
              change="Scores ≥ 50%"
              icon={CheckCircle2}
              tint="purple"
            />
            <Stat
              label="Awaiting grading"
              value={completedStats.awaitingGrading}
              change={completedStats.awaitingGrading > 0 ? 'Click Grade for Everyone' : 'All clear'}
              icon={Clock3}
              tint={completedStats.awaitingGrading > 0 ? 'orange' : 'teal'}
            />
          </div>

          {/* Grade Distribution & Performance Summary side-by-side */}
          <div className="dashboard-grid">
            <Panel
              title="Grade distribution"
              subtitle={`${exam.title} · ${exam.className}`}
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

            <Panel title="Performance summary" subtitle="Class benchmark evaluation">
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
                <Button kind="outline" onClick={() => go('Individual result & grading')}>
                  Review individual responses <ArrowRight size={14} />
                </Button>
              </div>
            </Panel>
          </div>

          {/* Student Submissions & Evaluation Table */}
          <Panel
            title={`Student submissions & evaluation (${scopedSubmissions.length}/${scopedCompletedRoster.length || scopedSubmissions.length} submitted)`}
            subtitle={`All ${scopedCompletedRoster.length} students enrolled in ${activeScope || (allAssignedClasses.length > 0 ? allAssignedClasses.join(', ') : exam.className)} and their submission status`}
            action={
              <Button icon={Download} kind="outline" onClick={handleExportCSV}>
                Export (CSV)
              </Button>
            }
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>ID</th>
                    <th>SCORE</th>
                    <th>GRADE</th>
                    <th>STATUS</th>
                    <th>VISIBILITY</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {scopedCompletedRoster.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: 'center',
                          padding: '24px',
                          color: 'var(--text-secondary, #94a3b8)'
                        }}
                      >
                        No students enrolled in this examination.
                      </td>
                    </tr>
                  ) : (
                    scopedCompletedRoster.map(item => {
                      const sub = item.sub;
                      return (
                        <tr key={item.id}>
                          <td>
                            <b>{item.name}</b>
                            <small>@{item.username}</small>
                          </td>
                          <td>{item.studentId}</td>
                          <td>
                            {sub && sub.score !== undefined ? (
                              <b>{`${sub.score}/${sub.maxScore || 100}`}</b>
                            ) : (
                              <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>—</span>
                            )}
                          </td>
                          <td>
                            {sub && sub.grade ? (
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
                                {sub.grade}
                              </Badge>
                            ) : (
                              <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>—</span>
                            )}
                          </td>
                          <td>
                            {sub ? (
                              <Badge tone={sub.status === 'Graded' ? 'green' : 'orange'}>
                                {sub.status}
                              </Badge>
                            ) : (
                              <Badge tone="gray">Not submitted</Badge>
                            )}
                          </td>
                          <td>
                            {sub ? (
                              <Badge tone={sub.resultsReleased ? 'green' : 'orange'}>
                                {sub.resultsReleased ? 'Released' : 'Withheld'}
                              </Badge>
                            ) : (
                              <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td>
                            {sub ? (
                              <button
                                className="text-link"
                                onClick={() => go('Individual result & grading')}
                              >
                                Review <ArrowRight size={13} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

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
