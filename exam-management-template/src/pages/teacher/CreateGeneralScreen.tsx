import React, { useState, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageHeading, Button, Stepper } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { wizardService } from '../../services/wizard.service';
import { storageService } from '../../services/storage.service';

export const CreateGeneralScreen: React.FC = () => {
  const { go, notify, showConfirm, setExamTitle } = useApp();
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

  const availableClasses = useMemo(() => {
    return storageService.getClasses();
  }, []);

  const [title, setTitle] = useState(draft.title);
  const [subject, setSubject] = useState(draft.subject);
  const [className, setClassName] = useState(draft.className || 'Unassigned');
  const [examDate, setExamDate] = useState(
    draft.examDate || new Date().toISOString().split('T')[0]
  );
  const [academicTerm, setAcademicTerm] = useState(draft.academicTerm);
  const [instructions, setInstructions] = useState(draft.instructions);

  const handleContinue = () => {
    if (!title.trim()) {
      notify('Please enter an examination title.');
      return;
    }
    wizardService.saveDraft({
      title,
      subject,
      className,
      examDate,
      academicTerm,
      instructions
    });
    setExamTitle(title);
    go('Create exam – questions');
  };

  const handleStepClick = (targetStep: number) => {
    if (title.trim()) {
      wizardService.saveDraft({
        title,
        subject,
        className,
        examDate,
        academicTerm,
        instructions
      });
      setExamTitle(title);
    }
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
        title="Create examination"
        desc="Set up the basic information for your new examination."
      />

      <div className="form-layout">
        <div className="panel form-panel">
          <Stepper current={1} onStepClick={handleStepClick} />

          <div className="form-section">
            <h3>General information</h3>
            <p>Start with a title and the class taking this examination.</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Examination title *</label>
              <small style={{ color: title.length >= 35 ? '#e6a05d' : 'var(--text-secondary, #94a3b8)', fontSize: '11px', fontWeight: 600 }}>
                {title.length}/40 characters
              </small>
            </div>
            <input
              className="field"
              value={title}
              maxLength={40}
              onChange={e => setTitle(e.target.value.slice(0, 40))}
              placeholder="e.g. Mathematics Midterm Assessment"
            />

            <div className="two-fields">
              <div>
                <label>Subject *</label>
                <select
                  className="field"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>English</option>
                  <option>Biology</option>
                </select>
              </div>

              <div>
                <label>Class</label>
                <select
                  className="field"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                >
                  <option value="Unassigned">Unassigned (Assign later via Classes)</option>
                  {availableClasses.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="two-fields">
              <div>
                <label>Examination date</label>
                <input
                  type="date"
                  className="field"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                />
              </div>

              <div>
                <label>Academic term</label>
                <select
                  className="field"
                  value={academicTerm}
                  onChange={e => setAcademicTerm(e.target.value)}
                >
                  <option>First semester</option>
                  <option>Second semester</option>
                </select>
              </div>
            </div>

            <label>Instructions for students</label>
            <textarea
              className="field"
              rows={4}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Instructions displayed to students before starting..."
            />
          </div>

          <div className="form-footer">
            <span className="muted">* Required fields</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button kind="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Continue to questions <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>

        <aside className="side-note">
          <div className="note-icon">
            <Sparkles size={18} />
          </div>
          <b>Helpful tip</b>
          <p>
            Give your examination a clear title so students can easily recognize it on their dashboard.
          </p>
          <div className="note-line" />
          <small>STEP 1 OF 4</small>
        </aside>
      </div>
    </>
  );
};
