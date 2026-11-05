import React, { useMemo, useState } from 'react';
import {
  Download,
  UserCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  ArrowRight,
  Sparkles,
  Lock,
  Unlock,
  Check,
  ClipboardList
} from 'lucide-react';
import { PageHeading, Button, Stat, Panel, Badge, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { gradingService } from '../../services/grading.service';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';

export const ResultsScreen: React.FC = () => {
  const { go, notify, selectedExamId, setSelectedExamId, dataVersion, refreshData, user } = useApp();

  const teacherUsername = user?.username || '';

  const exams = useMemo(() => {
    return examService.getExamsForTeacher(teacherUsername);
  }, [teacherUsername, dataVersion]);

  const teacherExamIds = useMemo(() => new Set(exams.map(e => e.id)), [exams]);

  const currentExam = useMemo(() => {
    if (exams.length === 0) return null;
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  const allSubmissions = useMemo(() => {
    return storageService.getSubmissions().filter(s => teacherExamIds.has(s.examId));
  }, [teacherExamIds, dataVersion]);

  // Submissions for the selected exam
  const examSubmissions = useMemo(() => {
    if (!currentExam) return [];
    return allSubmissions.filter(s => s.examId === currentExam.id);
  }, [allSubmissions, currentExam]);

  const areResultsReleased = useMemo(() => {
    if (!currentExam) return false;
    if (examSubmissions.length === 0) return Boolean(currentExam.resultsReleased);
    return examSubmissions.every(s => s.resultsReleased);
  }, [examSubmissions, currentExam]);

  // Calculate dynamic stats for this exam
  const stats = useMemo(() => {
    const list = examSubmissions;
    const gradedList = list.filter(s => s.status === 'Graded' && s.score !== undefined);
    const totalGraded = gradedList.length;
    const awaitingGrading = list.length - totalGraded;

    let averageScore = '0%';
    let passRate = '0%';
    if (totalGraded > 0) {
      const avg = Math.round(gradedList.reduce((acc, s) => acc + (s.score || 0), 0) / totalGraded);
      averageScore = `${avg}%`;
      const pass = Math.round((gradedList.filter(s => (s.score || 0) >= 50).length / totalGraded) * 100);
      passRate = `${pass}%`;
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

    return {
      totalGraded,
      awaitingGrading,
      averageScore,
      passRate,
      distribution
    };
  }, [examSubmissions, allSubmissions]);

  const handleGradeForEveryone = () => {
    if (!currentExam) return;
    const res = storageService.gradeAllSubmissionsForExam(currentExam.id);
    refreshData();
    notify(
      `Grading completed! Evaluated ${res.gradedCount} student submissions against the answer key. Results are now released to students.`
    );
  };

  const handleExport = () => {
    if (!currentExam) return;
    const csv = gradingService.exportResultsCSV(currentExam.id);
    const filename = formatCSVFilename(currentExam.title, currentExam.className, 'Exam_Results');
    downloadCSV(csv, filename);
    notify(`Exported results for ${currentExam.title} (${filename}).`);
  };

  if (!currentExam) {
    return (
      <div style={{ padding: '24px' }}>
        <Panel title="Results Dashboard">
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <ClipboardList size={48} style={{ opacity: 0.4, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No examination outcomes found
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 24px auto', fontSize: '14px', lineHeight: 1.5 }}>
              You do not have any examinations yet. Create and conduct examinations to view results and release grades.
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
      <PageHeading
        title="Results & performance"
        desc="Evaluate student submissions, manage scoring outcomes, and release official results."
      />

      {/* Exam selection bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 18px',
          background: 'var(--card-bg, #1e2433)',
          border: '1px solid var(--border-color, #2b354d)',
          borderRadius: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Active Examination:</span>
          <select
            value={currentExam.id}
            onChange={e => setSelectedExamId(e.target.value)}
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
                {e.title} ({e.className})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>Release Status:</span>
          <Badge tone={areResultsReleased ? 'green' : 'orange'}>
            {areResultsReleased ? (
              <>
                <Unlock size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                Results Released
              </>
            ) : (
              <>
                <Lock size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                Withheld (Awaiting Teacher Grade)
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          label="Students graded"
          value={stats.totalGraded}
          change="Evaluated"
          icon={UserCheck}
          tint="blue"
        />
        <Stat
          label="Average score"
          value={stats.averageScore}
          change="Class aggregate"
          icon={BarChart3}
          tint="teal"
        />
        <Stat
          label="Pass rate"
          value={stats.passRate}
          change="Scores ≥ 50%"
          icon={CheckCircle2}
          tint="purple"
        />
        <Stat
          label="Awaiting grading"
          value={stats.awaitingGrading}
          change={stats.awaitingGrading > 0 ? 'Click Grade for Everyone' : 'All clear'}
          icon={Clock3}
          tint={stats.awaitingGrading > 0 ? 'orange' : 'teal'}
        />
      </div>

      <div className="dashboard-grid">
        <Panel
          title="Grade distribution"
          subtitle={`${currentExam.title} · ${currentExam.className}`}
        >
          <div className="grade-bars">
            {stats.distribution.map(d => (
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

        <Panel title="Performance summary" subtitle="Selected examination evaluation">
          <div className="result-score">
            <b>{stats.averageScore}</b>
            <Badge tone="green">
              {parseInt(stats.averageScore, 10) >= 50 ? 'Passing benchmark' : 'Requires review'}
            </Badge>
          </div>
          <p className="muted" style={{ padding: '0 20px' }}>
            Calculated across {stats.totalGraded} student submissions for {currentExam.title}.
            {stats.awaitingGrading > 0 && (
              <span style={{ display: 'block', marginTop: '6px', color: '#e6a05d' }}>
                ⚠️ {stats.awaitingGrading} submissions are awaiting your release. Click "Grade for Everyone" above.
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

      <Panel
        title="Student submissions & evaluation"
        subtitle="Individual submission status and marks"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>EXAMINATION</th>
                <th>SCORE</th>
                <th>GRADE</th>
                <th>STATUS</th>
                <th>VISIBILITY</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {examSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary, #94a3b8)' }}>
                    No submissions recorded yet for {currentExam.title}.
                  </td>
                </tr>
              ) : (
                examSubmissions.map(r => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.studentName}</b>
                      <small>{r.studentId}</small>
                    </td>
                    <td>{r.examTitle}</td>
                    <td>
                      <b>{r.score !== undefined ? `${r.score}/${r.maxScore || 100}` : '—'}</b>
                    </td>
                    <td>
                      <Badge tone={r.grade === 'A' ? 'green' : r.grade === 'B' ? 'blue' : 'gray'}>
                        {r.grade || '—'}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={r.status === 'Graded' ? 'green' : 'orange'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={r.resultsReleased ? 'green' : 'orange'}>
                        {r.resultsReleased ? 'Released' : 'Withheld'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => go('Individual result & grading')}
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color, #2b354d)',
            background: 'var(--card-bg, #1e2433)',
            borderRadius: '0 0 10px 10px'
          }}
        >
          <Button
            kind={areResultsReleased ? 'outline' : 'primary'}
            icon={areResultsReleased ? Check : Sparkles}
            onClick={handleGradeForEveryone}
          >
            Regrade
          </Button>
          <Button icon={Download} kind="outline" onClick={handleExport}>
            Export (CSV)
          </Button>
        </div>
      </Panel>
    </>
  );
};
