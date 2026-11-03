import React from 'react';
import { Clock3, ListChecks, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageHeading, Button, Badge, LatexText, Stepper } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { wizardService } from '../../services/wizard.service';

export const ExamPreviewScreen: React.FC = () => {
  const { go, notify, showConfirm, setSelectedExamId, refreshData } = useApp();
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

  const handlePublish = () => {
    const published = wizardService.publishDraft();
    setSelectedExamId(published.id);
    refreshData();
    notify(`Examination "${published.title}" published successfully!`);
    go('Live monitoring');
  };

  return (
    <>
      <PageHeading
        title="Examination preview"
        desc="Review how students will see this examination before publishing."
        action={
          <Button
            kind="outline"
            onClick={() => go('Create exam – settings')}
          >
            <ArrowLeft size={15} /> Back to settings
          </Button>
        }
      />

      <div className="panel" style={{ padding: '14px 18px', marginBottom: '18px' }}>
        <Stepper current={4} />
      </div>

      <div className="preview-card">
        <div className="preview-banner">
          <Badge tone="blue">STUDENT PREVIEW</Badge>
          <h2>{draft.title}</h2>
          <p>
            {draft.className} · {draft.subject} · {draft.academicTerm}
          </p>
          <div className="preview-meta">
            <span>
              <Clock3 size={15} /> {draft.durationMinutes} minutes
            </span>
            <span>
              <ListChecks size={15} /> {draft.questions.length} questions
            </span>
            <span>
              <GraduationCap size={15} />{' '}
              {draft.questions.reduce((sum, q) => sum + q.marks, 0)} marks
            </span>
          </div>
        </div>

        <div className="preview-body">
          {draft.questions.length === 0 ? (
            <p className="muted" style={{ padding: '20px' }}>
              No questions in this examination preview.
            </p>
          ) : (
            draft.questions.map((q, idx) => (
              <div className="preview-question" key={q.id || idx}>
                <small>
                  QUESTION {idx + 1} · {q.marks} MARKS · {q.type.toUpperCase()}
                </small>
                <h3>
                  <LatexText text={q.text} />
                </h3>
                {q.type === 'Multiple choice' || q.type === 'True/false' ? (
                  q.options?.map(o => (
                    <div className="answer-preview" key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
                          border: '1px solid var(--border-color, #2b354d)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: 'var(--text-primary, #fff)',
                          margin: 0,
                          flexShrink: 0
                        }}
                      >
                        {o.id}
                      </span>
                      <LatexText text={o.text} />
                    </div>
                  ))
                ) : (
                  <p className="muted">Students will write their answer in a text response box.</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="preview-footer">
          <Button
            kind="outline"
            onClick={() => go('Create exam – questions')}
          >
            Edit questions
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button kind="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>
              Save and publish <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
