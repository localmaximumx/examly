import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PageHeading, Button, Stepper, Toggle } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { wizardService } from '../../services/wizard.service';
import { formatDisplayDate } from '../../utils/date.utils';

export const CreateSettingsScreen: React.FC = () => {
  const { go, notify, showConfirm } = useApp();
  const draft = wizardService.getDraft();

  const handleCancel = () => {
    showConfirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to cancel? Any unsaved edits will be discarded.',
      type: 'warning',
      confirmText: 'Discard & Exit',
      cancelText: 'Keep Editing',
      onConfirm: () => {
        wizardService.resetDraft();
        notify('Exam editing cancelled.');
        go(draft.id ? 'Exam details' : 'Examination list');
      }
    });
  };

  const [duration, setDuration] = useState<string>(String(draft.durationMinutes || 60));
  const [maxMarks, setMaxMarks] = useState<string>(String(draft.maxMarks || 10));
  const [startDateTime, setStartDateTime] = useState(
    `${draft.examDate || new Date().toISOString().split('T')[0]}T09:00`
  );
  const [gracePeriod, setGracePeriod] = useState(draft.lateGracePeriod);
  const [shuffleQ, setShuffleQ] = useState(draft.shuffleQuestions);
  const [shuffleOpt, setShuffleOpt] = useState(draft.shuffleOptions);
  const [allowReview, setAllowReview] = useState(draft.allowReview);
  const [autoSubmit, setAutoSubmit] = useState(draft.autoSubmit);
  const [releaseApproval, setReleaseApproval] = useState(draft.releaseResultsAfterApproval);

  const handleContinue = () => {
    let examDate = draft.examDate;
    let startTime = draft.startTime || '09:00 AM';
    if (startDateTime && startDateTime.includes('T')) {
      const [d, t] = startDateTime.split('T');
      if (d) examDate = formatDisplayDate(d);
      if (t) {
        const [h, m] = t.split(':');
        const hr = parseInt(h, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const h12 = hr % 12 || 12;
        startTime = `${String(h12).padStart(2, '0')}:${m || '00'} ${ampm}`;
      }
    }

    const durationNum = parseInt(duration, 10) || 60;
    const maxMarksNum = parseInt(maxMarks, 10) || 10;

    wizardService.saveDraft({
      durationMinutes: durationNum,
      maxMarks: maxMarksNum,
      examDate,
      startTime,
      lateGracePeriod: gracePeriod,
      shuffleQuestions: shuffleQ,
      shuffleOptions: shuffleOpt,
      allowReview,
      autoSubmit,
      releaseResultsAfterApproval: releaseApproval
    });
    go('Exam preview');
  };

  const handleStepClick = (targetStep: number) => {
    let examDate = draft.examDate;
    let startTime = draft.startTime || '09:00 AM';
    if (startDateTime && startDateTime.includes('T')) {
      const [d, t] = startDateTime.split('T');
      if (d) examDate = formatDisplayDate(d);
      if (t) {
        const [h, m] = t.split(':');
        const hr = parseInt(h, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const h12 = hr % 12 || 12;
        startTime = `${String(h12).padStart(2, '0')}:${m || '00'} ${ampm}`;
      }
    }
    const durationNum = parseInt(duration, 10) || 60;
    const maxMarksNum = parseInt(maxMarks, 10) || 10;
    wizardService.saveDraft({
      durationMinutes: durationNum,
      maxMarks: maxMarksNum,
      examDate,
      startTime,
      lateGracePeriod: gracePeriod,
      shuffleQuestions: shuffleQ,
      shuffleOptions: shuffleOpt,
      allowReview,
      autoSubmit,
      releaseResultsAfterApproval: releaseApproval
    });
    const routes: Record<number, any> = {
      1: 'Create exam – general information',
      2: 'Create exam – questions',
      3: 'Create exam – settings',
      4: 'Exam preview'
    };
    if (routes[targetStep]) {
      go(routes[targetStep]);
    }
  };

  return (
    <>
      <PageHeading
        title="Examination settings"
        desc="Configure timing, access, and grading rules."
      />

      <div className="form-layout">
        <div className="panel form-panel">
          <Stepper current={3} onStepClick={handleStepClick} />

          <div className="form-section">
            <h3>Timing and access</h3>
            <div className="two-fields">
              <div>
                <label>Duration (minutes) *</label>
                <input
                  className="field"
                  type="text"
                  inputMode="numeric"
                  value={duration}
                  onChange={e => setDuration(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 60"
                />
              </div>
              <div>
                <label>Maximum marks *</label>
                <input
                  className="field"
                  type="text"
                  inputMode="numeric"
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div className="two-fields">
              <div>
                <label>Start date and time</label>
                <input
                  className="field"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={e => setStartDateTime(e.target.value)}
                />
              </div>
              <div>
                <label>Late joining grace period</label>
                <select
                  className="field"
                  value={gracePeriod}
                  onChange={e => setGracePeriod(e.target.value)}
                >
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>No late joining</option>
                </select>
              </div>
            </div>

            <h3 className="subheading">Question and grading rules</h3>
            <Toggle
              label="Shuffle question order"
              checked={shuffleQ}
              onChange={setShuffleQ}
            />
            <Toggle
              label="Shuffle answer options"
              checked={shuffleOpt}
              onChange={setShuffleOpt}
            />
            <Toggle
              label="Allow students to review answers before submitting"
              checked={allowReview}
              onChange={setAllowReview}
            />
            <Toggle
              label="Automatically submit when time expires"
              checked={autoSubmit}
              onChange={setAutoSubmit}
            />
            <Toggle
              label="Release results after teacher approval"
              checked={releaseApproval}
              onChange={setReleaseApproval}
            />
          </div>

          <div className="form-footer">
            <Button kind="outline" onClick={() => go('Create exam – questions')}>
              Back
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button kind="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Preview examination <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>

        <aside className="side-note">
          <div className="note-icon">
            <ShieldCheck size={18} />
          </div>
          <b>Secure by design</b>
          <p>
            The server controls the official start time, deadline, and submission state. Student
            device clocks are not trusted.
          </p>
        </aside>
      </div>
    </>
  );
};
