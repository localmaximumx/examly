import React, { useMemo } from 'react';
import {
  Plus,
  ClipboardList,
  Activity,
  Users,
  BarChart3,
  ArrowRight,
  MoreHorizontal,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { PageHeading, Button, Stat, Panel, Badge, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';
import { gradingService } from '../../services/grading.service';
import { formatDisplayDate } from '../../utils/date.utils';

export const DashboardScreen: React.FC = () => {
  const { go, notify, user, setSelectedExamId, setExamTitle, setExamClassScope, dataVersion } = useApp();

  const teacherUsername = user?.username || 'alemu.tadesse';

  // Dynamic statistics calculated exclusively for this teacher's exams
  const stats = useMemo(() => {
    return examService.getDashboardStats(teacherUsername);
  }, [teacherUsername, dataVersion]);

  // Exams created by this teacher
  const teacherExams = useMemo(() => {
    return examService.getExamsForTeacher(teacherUsername);
  }, [teacherUsername, dataVersion]);

  const upcomingExams = useMemo(() => {
    return teacherExams.slice(0, 5);
  }, [teacherExams]);

  // Dynamic performance overview bars
  const chartBars = useMemo(() => {
    return examService.getTeacherPerformanceOverview(teacherUsername);
  }, [teacherUsername, dataVersion]);

  // Clicking on specific exam opens comprehensive Exam Details (or Live Monitoring if currently active)
  const handleSelectExam = (exam: { id: string; title: string; status: string }) => {
    setSelectedExamId(exam.id);
    setExamTitle(exam.title);
    setExamClassScope(null);
    if (exam.status === 'Active') {
      go('Live monitoring');
    } else if (exam.status === 'Completed') {
      go('Results dashboard');
    } else {
      go('Exam details');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <PageHeading
        title={`${getGreeting()}, ${user?.name ? user.name.split(' ')[0] : 'Teacher'}! 👋`}
        desc="Here's what's happening with your assigned examinations and student admissions today."
        action={
          <Button icon={Plus} onClick={() => go('Create exam – general information')}>
            Create examination
          </Button>
        }
      />

      <div className="stats-grid">
        <Stat
          label="Your examinations"
          value={String(stats.totalExams).padStart(2, '0')}
          change="Created by you"
          icon={ClipboardList}
          tint="blue"
        />
        <Stat
          label="Active sessions"
          value={String(stats.activeExams).padStart(2, '0')}
          change={`${stats.upcomingExams} ready`}
          icon={Activity}
          tint="purple"
        />
        <Stat
          label="Assigned students"
          value={stats.totalStudents}
          change="In your classes"
          icon={Users}
          tint="teal"
        />
        <Stat
          label="Average performance"
          value={stats.avgScore}
          change={`${stats.gradedCount} graded`}
          icon={BarChart3}
          tint="orange"
        />
      </div>

      <div className="dashboard-grid">
        <Panel
          title="Your examinations & sessions"
          subtitle="Click any examination to view student join requests & live room"
          action={
            <button className="text-link" onClick={() => go('Examination list')}>
              View all <ArrowRight size={14} />
            </button>
          }
        >
          <div className="upcoming-list">
            {upcomingExams.length === 0 ? (
              <p className="muted" style={{ padding: '20px' }}>
                No examinations found. Click "Create examination" to author your first assessment.
              </p>
            ) : (
              upcomingExams.map((e, i) => {
                const formattedDate = formatDisplayDate(e.examDate);
                const day = formattedDate.split(' ')[1]?.replace(',', '') || '04';
                const month = formattedDate.split(' ')[0]?.slice(0, 3)?.toUpperCase() || 'NOV';
                return (
                  <div
                    className="upcoming-item"
                    key={e.id}
                    onClick={() => handleSelectExam(e)}
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      borderRadius: '8px'
                    }}
                    title={e.status === 'Active' ? `Click to open Live Monitoring for ${e.title}` : `Click to view data for ${e.title}`}
                  >
                    <div className={`date-tile date-${i % 3}`}>
                      <b>{day}</b>
                      <small>{month}</small>
                    </div>
                    <div className="upcoming-info">
                      <b><LatexText text={e.title} /></b>
                      <small>
                        {e.className} · {e.duration} · {e.questions.length} questions
                      </small>
                    </div>
                    <div className="upcoming-right">
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
                      <small>
                        <Users size={12} /> {examService.getExamStudentInfo(e).label}
                      </small>
                    </div>
                    <button
                      className="icon-btn"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        handleSelectExam(e);
                      }}
                      title={e.status === 'Active' ? 'Open Live Monitoring' : 'View Data'}
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel title="Performance overview" subtitle="Live student averages across your assessments">
          <div className="chart-summary">
            <b>{stats.avgScore}</b>
            <Badge tone="green">Dynamic</Badge>
            <small>Live calculation from student submissions</small>
          </div>
          <div className="bar-chart">
            {chartBars.map((bar, i) => (
              <div className="bar-wrap" key={`${bar.label}-${i}`} title={bar.tooltip}>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(15, Math.min(100, bar.percentage))}%`,
                    transition: 'height 0.4s ease'
                  }}
                />
                <small>{bar.label}</small>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
};
