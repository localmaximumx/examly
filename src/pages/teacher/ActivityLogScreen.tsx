import React, { useMemo } from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { PageHeading, Panel, Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';

export const ActivityLogScreen: React.FC = () => {
  const { dataVersion, notify, user } = useApp();

  const teacherUsername = user?.username || '';
  const teacherExams = useMemo(() => examService.getExamsForTeacher(teacherUsername), [teacherUsername, dataVersion]);
  const teacherExamIds = useMemo(() => new Set(teacherExams.map(e => e.id)), [teacherExams]);

  const logs = useMemo(() => {
    const all = storageService.getActivityLogs();
    const currentName = (user?.name || '').toLowerCase();
    const currentUsername = teacherUsername.toLowerCase();
    return all.filter(l => {
      if (l.examId) return teacherExamIds.has(l.examId);
      if (l.user) {
        const u = l.user.toLowerCase();
        return u === currentName || u === currentUsername;
      }
      return false;
    });
  }, [dataVersion, teacherExamIds, teacherUsername, user]);

  const handleExportCSV = () => {
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const headers = ['Log ID', 'Action', 'User', 'Timestamp', 'Status'];
    const rows = logs.map(l => [
      escapeCSV(l.id),
      escapeCSV(l.action),
      escapeCSV(l.user || 'System'),
      escapeCSV(l.timestamp),
      escapeCSV('Recorded')
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename('School_Activity_Audit_Log');
    downloadCSV(csv, filename);
    notify(`Exported ${logs.length} activity audit log records (${filename}).`);
  };

  return (
    <>
      <PageHeading
        title="Activity log"
        desc="Review important actions performed in the school examination workspace."
        action={
          <Button kind="outline" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      <Panel title="Recent activity" subtitle="Illustrative audit events">
        <div className="activity-list">
          {logs.map((x, i) => (
            <div className="activity-row" key={x.id || i}>
              <i className={`activity-dot ${x.color || 'blue'}`} />
              <div>
                <b>{x.action}</b>
                <small>
                  {x.user && `${x.user} · `}
                  {x.timestamp}
                </small>
              </div>
              <Badge tone="gray">Recorded</Badge>
            </div>
          ))}
        </div>
      </Panel>

      <p className="muted footnote">
        <ShieldCheck size={14} /> Production audit events should be written by trusted server-side
        operations and protected from client modification.
      </p>
    </>
  );
};
