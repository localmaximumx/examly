import React, { useMemo } from 'react';
import { ArrowRight, Lock, CheckCircle2, Clock, FileCheck } from 'lucide-react';
import { PageHeading, Panel, Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { formatDisplayDate } from '../../utils/date.utils';

export const StudentHistoryScreen: React.FC = () => {
  const { go, user, setSelectedExamId, dataVersion } = useApp();

  const studentUser = user?.username || 'abel.tesfaye';
  const studentId = user?.studentId || 'STU-1001';

  const submissions = useMemo(() => {
    const list = storageService.getSubmissions();
    return list.filter(s => s.studentUsername === studentUser || s.studentId === studentId);
  }, [user, dataVersion, studentUser, studentId]);

  const allExams = useMemo(() => {
    return examService.getAllExams();
  }, [dataVersion]);

  // Combine real database submissions with assigned examinations
  const historyRows = useMemo(() => {
    if (submissions.length > 0) {
      return submissions.map(s => ({
        id: s.id,
        examId: s.examId,
        title: s.examTitle,
        subject: allExams.find(e => e.id === s.examId)?.subject || 'Mathematics',
        date: s.submittedAt ? formatDisplayDate(s.submittedAt.split('·')[0].trim()) : 'Nov 02, 2026',
        time: s.submittedAt ? (s.submittedAt.split('·')[1] || '').trim() : '',
        status: s.resultsReleased ? 'Graded' : 'Submitted',
        resultsReleased: s.resultsReleased,
        score: s.score,
        grade: s.grade,
        maxScore: s.maxScore || 100,
        answeredCount: s.answeredCount,
        totalQuestions: s.totalQuestions
      }));
    }

    // Default fallback if no submissions exist yet in local database
    return [
      {
        id: 'SUB-INIT-101',
        examId: 'EXM-001',
        title: 'Mathematics Midterm Examination',
        subject: 'Mathematics',
        date: 'Nov 02, 2026',
        time: '10:30 AM',
        status: 'Submitted',
        resultsReleased: false,
        score: undefined,
        grade: undefined,
        maxScore: 100,
        answeredCount: 20,
        totalQuestions: 20
      }
    ];
  }, [submissions, allExams]);

  const handleRowClick = (r: typeof historyRows[0]) => {
    setSelectedExamId(r.examId);
    if (!r.resultsReleased) {
      go('Submission receipt');
    } else {
      go('Student result view');
    }
  };

  return (
    <>
      <PageHeading
        title="Examination history"
        desc="Review your functional examination submissions, receipts, and released score reports."
        action={
          <Button kind="outline" onClick={() => go('Student home')}>
            Back to Dashboard
          </Button>
        }
      />

      <Panel title="Your examination records" subtitle="Real-time records from local database">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EXAMINATION</th>
                <th>SUBJECT</th>
                <th>DATE SUBMITTED</th>
                <th>STATUS</th>
                <th>RESULT</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {historyRows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => handleRowClick(r)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view details"
                >
                  <td>
                    <b>{r.title}</b>
                    <small>Receipt: {r.id}</small>
                  </td>
                  <td>{r.subject}</td>
                  <td>
                    {r.date}
                    {r.time && <small>{r.time}</small>}
                  </td>
                  <td>
                    <Badge tone={r.status === 'Graded' ? 'green' : 'blue'}>
                      {r.status === 'Graded' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}{' '}
                      {r.status}
                    </Badge>
                  </td>
                  <td>
                    {r.resultsReleased && r.score !== undefined ? (
                      <span style={{ fontWeight: 600, color: '#34d399' }}>
                        {r.score}/{r.maxScore} (Grade {r.grade})
                      </span>
                    ) : (
                      <Badge tone="orange">
                        <Lock size={11} style={{ verticalAlign: '-1px', marginRight: '3px' }} />
                        Pending Teacher Release
                      </Badge>
                    )}
                  </td>
                  <td>
                    <button
                      className="text-link"
                      onClick={() => handleRowClick(r)}
                    >
                      {r.resultsReleased ? 'View Result' : 'View Receipt'} <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
