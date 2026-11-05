import React, { useState, useMemo } from 'react';
import {
  FileBarChart,
  ClipboardList,
  Users,
  BarChart3,
  FileText,
  CalendarDays,
  Download,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { PageHeading, Button, Stat, Panel, Badge } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { gradingService } from '../../services/grading.service';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { formatCSVFilename, downloadCSV, escapeCSV } from '../../utils/csv.utils';

export const ReportsScreen: React.FC = () => {
  const { notify, user, selectedExamId, setSelectedExamId } = useApp();

  const exams = useMemo(() => examService.getExamsForTeacher(user?.username), [user]);
  const teacherExamIds = useMemo(() => new Set(exams.map(e => e.id)), [exams]);
  const allStudents = useMemo(() => storageService.getStudents(), []);
  const allSubmissions = useMemo(() => storageService.getSubmissions().filter(s => teacherExamIds.has(s.examId)), [teacherExamIds]);
  const results = useMemo(() => gradingService.getResultsStats(), []);

  const completedExams = useMemo(() => exams.filter(e => e.status === 'Completed'), [exams]);

  const [activeExamId, setActiveExamId] = useState<string>(() => {
    if (selectedExamId && exams.some(e => e.id === selectedExamId)) {
      return selectedExamId;
    }
    const firstCompleted = exams.find(e => e.status === 'Completed');
    return firstCompleted?.id || exams[0]?.id || '';
  });
  const [selectedSemester, setSelectedSemester] = useState<string>('First semester');
  const academicYear = '2026/2027';

  const currentExam = useMemo(() => {
    if (exams.length === 0) return null;
    return exams.find(e => e.id === activeExamId) || completedExams[0] || exams[0];
  }, [exams, activeExamId, completedExams]);

  const isCurrentExamCompleted = currentExam?.status === 'Completed';

  // --- 1. EXPORT BY EXAM: All Student Outcomes for This Examination ---
  const handleExportExamReport = () => {
    if (!currentExam) return;
    if (currentExam.status !== 'Completed') {
      notify(`Exporting is only possible for completed examinations. "${currentExam.title}" is currently ${currentExam.status}.`);
      return;
    }
    const csv = gradingService.exportResultsCSV(currentExam.id);
    const filename = formatCSVFilename(currentExam.title, currentExam.className, 'Exam_Outcomes');
    downloadCSV(csv, filename);
    notify(`Exported outcomes for "${currentExam.title}" (${filename}).`);
  };

  // --- 2. EXPORT BY SEMESTER: All Students Across All Classes for the Selected Semester ---
  const handleExportSemesterReport = () => {
    const semesterCompletedExams = exams.filter(
      e => e.status === 'Completed' && (!e.academicTerm || e.academicTerm.toLowerCase() === selectedSemester.toLowerCase())
    );

    if (semesterCompletedExams.length === 0) {
      notify(`No completed examinations found for ${selectedSemester}. Exporting is only possible for completed exams.`);
      return;
    }

    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Academic Term',
      'Academic Year',
      'Completed Exams Attempted',
      'Total Score Earned',
      'Max Score Possible',
      'Semester Average (%)',
      'Letter Grade',
      'Pass/Fail Status',
      'Academic Standing'
    ];

    const rows = allStudents.map(st => {
      // Find submissions for this student from completed exams only
      const studentSubs = allSubmissions.filter(
        s => s.studentId === st.studentId || s.studentUsername === st.username
      );
      // Filter by semester and ONLY completed examinations
      const termSubs = studentSubs.filter(sub => {
        const exam = exams.find(e => e.id === sub.examId);
        return exam?.status === 'Completed' && (!exam?.academicTerm || exam.academicTerm.toLowerCase() === selectedSemester.toLowerCase());
      });

      const graded = termSubs.filter(s => s.status === 'Graded' && s.score !== undefined);
      const totalEarned = graded.reduce((sum, s) => sum + (s.score || 0), 0);
      const maxPossible = graded.reduce((sum, s) => sum + (s.maxScore || 100), 0) || (graded.length * 100);

      let percentage = '—';
      let grade = 'Pending';
      let passStatus = 'Incomplete';
      let standing = 'Satisfactory';

      if (graded.length > 0 && maxPossible > 0) {
        const pct = Math.round((totalEarned / maxPossible) * 100);
        percentage = `${pct}%`;
        if (pct >= 85) {
          grade = 'A';
          standing = "Dean's List";
        } else if (pct >= 75) {
          grade = 'B';
          standing = 'Good Standing';
        } else if (pct >= 65) {
          grade = 'C';
          standing = 'Satisfactory';
        } else if (pct >= 50) {
          grade = 'D';
          standing = 'Academic Warning';
        } else {
          grade = 'F';
          standing = 'Requires Remediation';
        }
        passStatus = pct >= 50 ? 'Pass' : 'Fail';
      }

      return [
        escapeCSV(st.studentId),
        escapeCSV(st.name),
        escapeCSV(st.className),
        escapeCSV(selectedSemester),
        escapeCSV(academicYear),
        escapeCSV(termSubs.length),
        escapeCSV(graded.length > 0 ? totalEarned : '—'),
        escapeCSV(graded.length > 0 ? maxPossible : '—'),
        escapeCSV(percentage),
        escapeCSV(grade),
        escapeCSV(passStatus),
        escapeCSV(standing)
      ];
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename(selectedSemester, 'All_Students', 'Academic_Summary');
    downloadCSV(csv, filename);
    notify(`Exported ${selectedSemester} summary of completed exams for all ${allStudents.length} students (${filename}).`);
  };

  // --- 3. EXPORT BY YEAR: Comprehensive Annual Academic Record of All Students ---
  const handleExportYearReport = () => {
    const yearCompletedExams = exams.filter(e => e.status === 'Completed');
    if (yearCompletedExams.length === 0) {
      notify(`No completed examinations found for Academic Year ${academicYear}. Exporting is only possible for completed exams.`);
      return;
    }

    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Academic Year',
      'Total Completed Exams',
      'Total Marks Scored',
      'Max Possible Marks',
      'Annual Cumulative GPA (%)',
      'Annual Letter Grade',
      'Benchmark Status',
      'Honours / Standing'
    ];

    const rows = allStudents.map(st => {
      const studentSubs = allSubmissions.filter(s => {
        const exam = exams.find(e => e.id === s.examId);
        return exam?.status === 'Completed' && (s.studentId === st.studentId || s.studentUsername === st.username);
      });
      const graded = studentSubs.filter(s => s.status === 'Graded' && s.score !== undefined);
      const totalEarned = graded.reduce((sum, s) => sum + (s.score || 0), 0);
      const maxPossible = graded.reduce((sum, s) => sum + (s.maxScore || 100), 0) || (graded.length * 100);

      let gpa = '—';
      let grade = 'Pending';
      let status = 'Incomplete';
      let honours = 'Regular';

      if (graded.length > 0 && maxPossible > 0) {
        const pct = Math.round((totalEarned / maxPossible) * 100);
        gpa = `${pct}%`;
        if (pct >= 90) {
          grade = 'A+';
          honours = 'First Class Honours';
        } else if (pct >= 80) {
          grade = 'A';
          honours = 'Distinction';
        } else if (pct >= 70) {
          grade = 'B';
          honours = 'Merit';
        } else if (pct >= 50) {
          grade = 'C';
          honours = 'Satisfactory';
        } else {
          grade = 'F';
          honours = 'Academic Probation';
        }
        status = pct >= 50 ? 'Benchmark Passed' : 'Academic Review';
      }

      return [
        escapeCSV(st.studentId),
        escapeCSV(st.name),
        escapeCSV(st.className),
        escapeCSV(academicYear),
        escapeCSV(studentSubs.length),
        escapeCSV(graded.length > 0 ? totalEarned : '—'),
        escapeCSV(graded.length > 0 ? maxPossible : '—'),
        escapeCSV(gpa),
        escapeCSV(grade),
        escapeCSV(status),
        escapeCSV(honours)
      ];
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename(`Academic_Year_${academicYear.replace('/', '_')}`, 'All_Students', 'Annual_Report');
    downloadCSV(csv, filename);
    notify(`Exported annual evaluation of completed exams for all ${allStudents.length} students (${filename}).`);
  };

  // --- 4. EXPORT BY EXAM: Attendance & Live Session Audit ---
  const handleExportAttendanceAudit = () => {
    if (!currentExam) return;
    if (currentExam.status !== 'Completed') {
      notify(`Exporting is only possible for completed examinations. "${currentExam.title}" is currently ${currentExam.status}.`);
      return;
    }
    const requests = storageService.getJoinRequests(currentExam.id);
    const submissions = storageService.getSubmissions().filter(s => s.examId === currentExam.id);

    let dataList = requests.map(req => {
      const sub = submissions.find(s => s.studentId === req.studentId || s.studentUsername === req.studentUsername);
      return {
        name: req.studentName,
        studentId: req.studentId,
        username: req.studentUsername,
        className: req.className,
        admissionStatus: req.status === 'Approved' ? 'Admitted' : req.status === 'Rejected' ? 'Declined' : 'Pending',
        progress: sub ? 'Completed & Submitted' : req.status === 'Approved' ? 'In Progress' : 'In Lobby',
        time: req.requestedAt ? new Date(req.requestedAt).toLocaleTimeString() : '—'
      };
    });

    if (dataList.length === 0) {
      const classStudents = allStudents.filter(s => s.className.toLowerCase() === currentExam.className.toLowerCase());
      dataList = classStudents.map(st => ({
        name: st.name,
        studentId: st.studentId,
        username: st.username,
        className: st.className,
        admissionStatus: 'Enrolled Cohort',
        progress: 'Not yet joined',
        time: '—'
      }));
    }

    const headers = [
      'Student Name',
      'Student ID',
      'Class',
      'Username',
      'Examination',
      'Admission Status',
      'Exam Progress',
      'Timestamp'
    ];

    const rows = dataList.map(d => [
      escapeCSV(d.name),
      escapeCSV(d.studentId),
      escapeCSV(d.className),
      escapeCSV(d.username),
      escapeCSV(currentExam.title),
      escapeCSV(d.admissionStatus),
      escapeCSV(d.progress),
      escapeCSV(d.time)
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename(currentExam.title, currentExam.className, 'Session_Audit');
    downloadCSV(csv, filename);
    notify(`Exported session attendance audit for "${currentExam.title}" (${filename}).`);
  };

  return (
    <>
      <PageHeading
        title="Reports & analytics"
        desc="Export official CSV reports by Examination, by Semester (all students), or for the full Academic Year (all students)."
      />

      <div className="stats-grid">
        <Stat
          label="Total examinations"
          value={exams.length}
          change="Available for export"
          icon={ClipboardList}
          tint="blue"
        />
        <Stat
          label="Students covered"
          value={allStudents.length}
          change="School-wide cohort"
          icon={Users}
          tint="purple"
        />
        <Stat
          label="Current academic term"
          value={selectedSemester}
          change={`Year ${academicYear}`}
          icon={CalendarDays}
          tint="teal"
        />
        <Stat
          label="Average score"
          value={results.averageScore}
          change="School benchmark"
          icon={BarChart3}
          tint="orange"
        />
      </div>

      {/* Target Parameters Bar */}
      {!currentExam ? (
        <Panel title="Examinations">
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <ClipboardList size={48} style={{ opacity: 0.4, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No examinations found for reports
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '14px', lineHeight: 1.5 }}>
              You do not have any examinations yet. Create examinations and grade submissions to generate analytical reports.
            </p>
          </div>
        </Panel>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '20px',
              padding: '14px 20px',
              background: 'var(--card-bg, #1e2433)',
              border: '1px solid var(--border-color, #2b354d)',
              borderRadius: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Active Examination:</span>
                <select
                  value={currentExam.id}
                  onChange={e => {
                    setActiveExamId(e.target.value);
                    setSelectedExamId(e.target.value);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '7px',
                    background: 'var(--bg-secondary, #151a26)',
                    color: 'var(--text-primary, #fff)',
                    border: '1px solid var(--border-color, #2b354d)',
                    fontSize: '13px'
                  }}
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.status === 'Completed' ? '✓ ' : '⏳ '}{e.title} ({e.className}) [{e.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Semester Scope:</span>
                <select
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '7px',
                    background: 'var(--bg-secondary, #151a26)',
                    color: 'var(--text-primary, #fff)',
                    border: '1px solid var(--border-color, #2b354d)',
                    fontSize: '13px'
                  }}
                >
                  <option value="First semester">First semester</option>
                  <option value="Second semester">Second semester</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Academic Year:</span>
              <Badge tone="purple">{academicYear}</Badge>
            </div>
          </div>

      {/* 4 Standardized Report Cards */}
      <div className="report-grid">
        {/* Card 1: By Exam */}
        <div className="report-card" style={{ opacity: isCurrentExamCompleted ? 1 : 0.88 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
            <div className="report-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', margin: 0 }}>
              <FileText size={20} />
            </div>
            <Badge tone={isCurrentExamCompleted ? 'purple' : 'orange'}>
              {isCurrentExamCompleted ? 'EXAM SCOPE · COMPLETED' : `EXAM SCOPE · ${currentExam.status.toUpperCase()}`}
            </Badge>
          </div>
          <h3>Examination Outcomes</h3>
          <p>
            Complete student evaluation, marks, percentages, and released results for <b>{currentExam.title}</b> ({currentExam.className}).
          </p>
          {!isCurrentExamCompleted && (
            <div style={{ margin: '8px 0', padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '11px', fontWeight: 600 }}>
              ⚠️ Exporting is only possible for completed examinations.
            </div>
          )}
          <small>Dynamic file: {formatCSVFilename(currentExam.title, currentExam.className, 'Exam_Outcomes')}</small>
          <Button
            kind={isCurrentExamCompleted ? 'primary' : 'outline'}
            icon={Download}
            onClick={handleExportExamReport}
            disabled={!isCurrentExamCompleted}
            style={{ opacity: isCurrentExamCompleted ? 1 : 0.5, cursor: isCurrentExamCompleted ? 'pointer' : 'not-allowed' }}
          >
            {isCurrentExamCompleted ? 'Export Exam CSV' : `Export Disabled (${currentExam.status})`}
          </Button>
        </div>

        {/* Card 2: By Semester (All Students) */}
        <div className="report-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
            <div className="report-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', margin: 0 }}>
              <GraduationCap size={20} />
            </div>
            <Badge tone="green">SEMESTER SCOPE · ALL STUDENTS</Badge>
          </div>
          <h3>Semester Academic Summary</h3>
          <p>
            Comprehensive academic performance, exam averages, and pass/fail standings of <b>all {allStudents.length} students</b> for {selectedSemester}.
          </p>
          <small>Dynamic file: {formatCSVFilename(selectedSemester, 'All_Students', 'Academic_Summary')}</small>
          <Button
            kind="outline"
            icon={Download}
            onClick={handleExportSemesterReport}
          >
            Export Semester CSV
          </Button>
        </div>

        {/* Card 3: By Year (All Students) */}
        <div className="report-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
            <div className="report-icon" style={{ background: 'rgba(230, 160, 93, 0.15)', color: '#e6a05d', margin: 0 }}>
              <CalendarDays size={20} />
            </div>
            <Badge tone="orange">YEAR SCOPE · ALL STUDENTS</Badge>
          </div>
          <h3>Academic Year Comprehensive Report</h3>
          <p>
            Official annual academic evaluation covering <b>all {allStudents.length} students</b> across both terms for Academic Year {academicYear}.
          </p>
          <small>Dynamic file: {formatCSVFilename(`Academic_Year_${academicYear.replace('/', '_')}`, 'All_Students', 'Annual_Report')}</small>
          <Button
            kind="outline"
            icon={Download}
            onClick={handleExportYearReport}
          >
            Export Year CSV
          </Button>
        </div>

        {/* Card 4: Attendance & Session Audit (By Exam) */}
        <div className="report-card" style={{ opacity: isCurrentExamCompleted ? 1 : 0.88 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
            <div className="report-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', margin: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <Badge tone={isCurrentExamCompleted ? 'purple' : 'orange'}>
              {isCurrentExamCompleted ? 'ATTENDANCE · COMPLETED' : `ATTENDANCE · ${currentExam.status.toUpperCase()}`}
            </Badge>
          </div>
          <h3>Exam Attendance & Session Audit</h3>
          <p>
            Official verification log of student check-in timestamps, admission approval logs, and progress for <b>{currentExam.title}</b>.
          </p>
          {!isCurrentExamCompleted && (
            <div style={{ margin: '8px 0', padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '11px', fontWeight: 600 }}>
              ⚠️ Exporting is only possible for completed examinations.
            </div>
          )}
          <small>Dynamic file: {formatCSVFilename(currentExam.title, currentExam.className, 'Session_Audit')}</small>
          <Button
            kind="outline"
            icon={Download}
            onClick={handleExportAttendanceAudit}
            disabled={!isCurrentExamCompleted}
            style={{ opacity: isCurrentExamCompleted ? 1 : 0.5, cursor: isCurrentExamCompleted ? 'pointer' : 'not-allowed' }}
          >
            {isCurrentExamCompleted ? 'Export Audit CSV' : `Export Disabled (${currentExam.status})`}
          </Button>
        </div>
      </div>
      </>
    )}
  </>
);
};
