import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, ArrowRight, Trash2, Activity, FileText, Pencil } from 'lucide-react';
import { PageHeading, Button, Panel, Badge, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';
import { formatDisplayDate } from '../../utils/date.utils';
import { gradingService } from '../../services/grading.service';
import { wizardService } from '../../services/wizard.service';
import { Examination } from '../../types';

const formatClassShort = (className?: string): string => {
  if (!className || className === 'Unassigned') return '-';
  return className
    .split(',')
    .map(c => {
      const trimmed = c.trim();
      return trimmed.replace(/^Grade[- ]*(\d+)\s*([A-Za-z]*)$/i, 'G$1$2');
    })
    .join(', ');
};

export const ExamListScreen: React.FC = () => {
  const { go, notify, showConfirm, setSelectedExamId, setExamTitle, setExamClassScope, dataVersion, refreshData, user } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');

  const teacherUsername = user?.username || '';

  const filteredExams = useMemo(() => {
    return examService.filterExams(search, selectedTab, teacherUsername);
  }, [search, selectedTab, dataVersion, teacherUsername]);

  // Clicking an exam from Examination List opens comprehensive data across all classes
  const handleSelectExam = (exam: Examination) => {
    setSelectedExamId(exam.id);
    setExamTitle(exam.title);
    setExamClassScope(null); // Comprehensive view across all classes
    if (exam.status === 'Active') {
      go('Live monitoring');
    } else if (exam.status === 'Completed') {
      go('Results dashboard');
    } else {
      go('Exam details');
    }
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Delete Examination',
      message: `Are you sure you want to delete "${title}"? All associated questions and records will be permanently removed.`,
      type: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: () => {
        examService.deleteExam(id);
        refreshData();
        notify(`Examination "${title}" deleted.`);
      }
    });
  };

  const handleExport = () => {
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'Exam Code',
      'Title',
      'Subject',
      'Class',
      'Date',
      'Start Time',
      'Duration',
      'Status',
      'Questions Count',
      'Total Marks',
      'Assigned Students',
      'Results Released',
      'Teacher'
    ];
    const rows = filteredExams.map(e => [
      escapeCSV(e.code),
      escapeCSV(e.title),
      escapeCSV(e.subject),
      escapeCSV(e.className),
      escapeCSV(formatDisplayDate(e.examDate)),
      escapeCSV(e.startTime || '09:00 AM'),
      escapeCSV(e.duration),
      escapeCSV(e.status),
      escapeCSV(e.questions.length),
      escapeCSV(e.totalMarks),
      escapeCSV(e.assignedStudentCount || 0),
      escapeCSV(e.resultsReleased ? 'Yes' : 'No'),
      escapeCSV(e.teacherName || 'Faculty')
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename('Examinations', 'Directory');
    downloadCSV(csv, filename);
    notify(`Exported ${filteredExams.length} examinations (${filename}).`);
  };

  return (
    <>
      <PageHeading
        title="Examinations"
        desc="Create, organize, and manage your school's examinations."
        action={
          <Button icon={Plus} onClick={() => go('Create exam – general information')}>
            Create examination
          </Button>
        }
      />

      <div className="toolbar">
        <div className="searchbox">
          <Search size={16} />
          <input
            placeholder="Search examinations by title, code, class, or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Button kind="outline" icon={Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <Panel
        title="All examinations"
        subtitle={`${filteredExams.length} examinations found (Click active exam for Live Monitoring, completed for Data)`}
        action={
          <div className="tabs">
            {['All', 'Active', 'Ready', 'Completed'].map(t => (
              <button
                className={`tab ${selectedTab === t ? 'active' : ''}`}
                key={t}
                onClick={() => setSelectedTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EXAMINATION</th>
                <th>CLASS</th>
                <th>DATE</th>
                <th>DURATION</th>
                <th>STUDENTS</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    No examinations found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExams.map(e => {
                  const displayTitle = e.title.length > 25 ? e.title.slice(0, 25).trim() + '...' : e.title;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => handleSelectExam(e)}
                      style={{ cursor: 'pointer' }}
                      title={e.status === 'Active' ? 'Click to open Live Monitoring' : 'Click to view examination data'}
                    >
                      <td>
                        <b title={e.title}><LatexText text={displayTitle} /></b>
                        <small>{e.code}</small>
                      </td>
                    <td>
                      {(!e.assignedClassNames || e.assignedClassNames.length === 0) && (!e.className || e.className === 'Unassigned') ? (
                        <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px', fontWeight: 600 }}>
                          -
                        </span>
                      ) : e.assignedClassNames && e.assignedClassNames.length > 1 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {e.assignedClassNames.map(c => (
                            <Badge key={c} tone="purple" style={{ fontSize: '11px', padding: '2px 7px' }}>
                              {formatClassShort(c)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{formatClassShort(e.className)}</span>
                      )}
                    </td>
                    <td>{formatDisplayDate(e.examDate)}</td>
                    <td>{e.duration}</td>
                    <td>
                      {(() => {
                        const info = examService.getExamStudentInfo(e);
                        const isUnassigned = !e.className || e.className === 'Unassigned';
                        return (
                          <div>
                            <b style={{ fontSize: '14px', color: isUnassigned ? 'var(--text-secondary, #94a3b8)' : undefined }}>
                              {isUnassigned ? 0 : info.count}
                            </b>
                            <small
                              style={{
                                display: 'block',
                                fontSize: '11px',
                                color: 'var(--text-secondary, #94a3b8)',
                                lineHeight: '1.2'
                              }}
                            >
                              {isUnassigned ? 'unassigned' : info.subtext}
                            </small>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <Badge
                        tone={
                          e.status === 'Active'
                            ? 'green'
                            : e.status === 'Completed'
                            ? 'purple'
                            : 'blue'
                        }
                      >
                        {e.status}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="text-link"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleSelectExam(e);
                          }}
                        >
                          {e.status === 'Active' ? (
                            <>
                              <Activity size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />
                              Live Monitor
                            </>
                          ) : e.status === 'Completed' ? (
                            <>
                              <FileText size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />
                              View Results
                            </>
                          ) : (
                            <>
                              <FileText size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />
                              View Details
                            </>
                          )}{' '}
                          <ArrowRight size={13} />
                        </button>
                        {e.status !== 'Active' && e.status !== 'Completed' && (
                          <button
                            className="icon-btn"
                            title="Edit examination"
                            onClick={ev => {
                              ev.stopPropagation();
                              wizardService.loadExamToDraft(e);
                              setSelectedExamId(e.id);
                              setExamTitle(e.title);
                              notify(`Editing "${e.title}".`);
                              go('Create exam – general information');
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          className="icon-btn"
                          title="Delete examination"
                          onClick={ev => handleDelete(e.id, e.title, ev)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
