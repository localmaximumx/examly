import React, { useMemo } from 'react';
import { Timer } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { examService } from '../../services/exam.service';

export const StartConfirmationScreen: React.FC = () => {
  const { go, notify, selectedExamId, refreshData, user } = useApp();

  const teacherUsername = user?.username || '';
  const teacherExams = useMemo(() => {
    return examService.getExamsForTeacher(teacherUsername);
  }, [teacherUsername]);

  const exam = useMemo(() => {
    return teacherExams.find(e => e.id === selectedExamId) || teacherExams[0] || null;
  }, [selectedExamId, teacherExams]);

  const handleConfirmStart = () => {
    if (!exam) return;
    const res = examService.startOfficialExam(exam.id);
    if (res.success) {
      refreshData();
      notify(`"${exam.title}" is now LIVE! Official synchronized countdown started.`);
      go('Live monitoring');
    } else {
      notify(res.message || 'Could not start examination.');
    }
  };

  if (!exam) {
    return (
      <div className="center-state">
        <Badge tone="orange">EXAMINATION NOT FOUND</Badge>
        <h1>Examination Unavailable</h1>
        <p>This examination could not be found or you do not have permission to start it.</p>
        <Button kind="primary" onClick={() => go('Examination list')}>
          Back to Examinations
        </Button>
      </div>
    );
  }

  return (
    <div className="center-state">
      <div className="confirm-icon">
        <Timer size={31} />
      </div>
      <Badge tone="orange">OFFICIAL START CONFIRMATION</Badge>
      <h1>Ready to start this examination?</h1>
      <p>
        Starting this examination will open access for all admitted students in the waiting room
        and begin the unified synchronized countdown timer.
      </p>

      <div className="confirm-summary">
        <div>
          <small>EXAMINATION</small>
          <b>{exam.title}</b>
        </div>
        <div>
          <small>ASSIGNED CLASS</small>
          <b>
            {exam.className} · {exam.assignedStudentCount} enrolled students
          </b>
        </div>
        <div>
          <small>SYNCHRONIZED DURATION</small>
          <b>{exam.duration}</b>
        </div>
        <div>
          <small>START POLICY</small>
          <b>Unified server countdown for teacher and all students</b>
        </div>
      </div>

      <div className="confirm-actions">
        <Button kind="outline" onClick={() => go('Live monitoring')}>
          Go back
        </Button>
        <Button onClick={handleConfirmStart} icon={Timer}>
          Confirm and start session
        </Button>
      </div>

      <small className="muted">
        Starting will set status to Active and synchronize the countdown across all connected devices.
      </small>
    </div>
  );
};
