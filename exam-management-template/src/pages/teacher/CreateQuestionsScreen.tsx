import React, { useState } from 'react';
import {
  Upload,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  BookOpen,
  X,
  Check,
  Code2,
  Sparkles,
  Key,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { PageHeading, Button, Stepper, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { wizardService } from '../../services/wizard.service';
import { questionService } from '../../services/question.service';
import { Question, QuestionType } from '../../types';

export const CreateQuestionsScreen: React.FC = () => {
  const { go, notify, showAlert, showConfirm } = useApp();
  const [draft, setDraft] = useState(() => wizardService.getDraft());
  const [questions, setQuestions] = useState<Question[]>(draft.questions);

  // Question editing / adding modal
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importBankOpen, setImportBankOpen] = useState(false);

  // Active question form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('Multiple choice');
  const [qMarks, setQMarks] = useState(2);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');

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

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const openAddQuestion = () => {
    setEditingIndex(null);
    setQText('');
    setQType('Multiple choice');
    setQMarks(2);
    setQOptions(['', '', '', '']);
    setQCorrect('');
    setModalOpen(true);
  };

  const openEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingIndex(index);
    setQText(q.text);
    setQType(q.type);
    setQMarks(q.marks);
    setQOptions(q.options?.map(o => o.text) || ['', '', '', '']);
    setQCorrect(q.correctAnswer || '');
    setModalOpen(true);
  };

  const insertLatex = (snippet: string) => {
    setQText(prev => (prev ? `${prev} ${snippet}` : snippet));
  };

  const saveQuestion = () => {
    if (!qText.trim()) {
      showAlert({
        title: 'Question Content Required',
        message: 'Please enter question text before adding it to the examination.',
        type: 'warning'
      });
      return;
    }

    if (!qCorrect) {
      showAlert({
        title: 'Answer Key Required',
        message:
          'Please select the confidential Answer Key for this question. This key is used for automated grading and will remain strictly confidential and hidden from students.',
        type: 'warning'
      });
      return;
    }

    if (qType === 'Multiple choice') {
      const hasEmpty = qOptions.some(opt => !opt.trim());
      if (hasEmpty) {
        showAlert({
          title: 'Options Incomplete',
          message: 'Please provide content for all 4 choices (A, B, C, D) before saving.',
          type: 'warning'
        });
        return;
      }
    }

    const newQ: Question = {
      id: editingIndex !== null ? questions[editingIndex].id : `Q-${Date.now()}`,
      questionNumber: editingIndex !== null ? editingIndex + 1 : questions.length + 1,
      text: qText,
      type: qType,
      marks: Number(qMarks) || 1,
      options:
        qType === 'Multiple choice'
          ? qOptions.map((opt, i) => ({ id: String.fromCharCode(65 + i), text: opt }))
          : qType === 'True/false'
          ? [
              { id: 'A', text: 'True' },
              { id: 'B', text: 'False' }
            ]
          : undefined,
      correctAnswer: qCorrect
    };

    let updated: Question[];
    if (editingIndex !== null) {
      updated = [...questions];
      updated[editingIndex] = newQ;
    } else {
      updated = [...questions, newQ];
    }

    setQuestions(updated);
    wizardService.saveDraft({ questions: updated });
    setModalOpen(false);
    notify(editingIndex !== null ? 'Question updated.' : 'New question added with answer key.');
  };

  const deleteQuestion = (index: number) => {
    showConfirm({
      title: 'Delete Question',
      message: `Are you sure you want to remove Question ${index + 1}?`,
      type: 'danger',
      confirmText: 'Delete Question',
      onConfirm: () => {
        const updated = questions.filter((_, i) => i !== index).map((q, i) => ({
          ...q,
          questionNumber: i + 1
        }));
        setQuestions(updated);
        wizardService.saveDraft({ questions: updated });
        notify('Question deleted.');
      }
    });
  };

  const importFromBank = (bankQ: Question) => {
    const cloned = questionService.cloneForExam(bankQ, questions.length + 1);
    const updated = [...questions, cloned];
    setQuestions(updated);
    wizardService.saveDraft({ questions: updated });
    notify(`Imported question into exam.`);
  };

  const handleContinue = () => {
    if (questions.length === 0) {
      showAlert({
        title: 'Questions Required',
        message: 'Please add at least one question before proceeding to settings.',
        type: 'warning'
      });
      return;
    }

    const unkeyed = questions.find(q => !q.correctAnswer);
    if (unkeyed) {
      showAlert({
        title: 'Missing Answer Key',
        message: `Question ${unkeyed.questionNumber} does not have an answer key designated. Please edit Question ${unkeyed.questionNumber} and select the confidential correct answer before continuing.`,
        type: 'warning'
      });
      return;
    }

    wizardService.saveDraft({ questions });
    go('Create exam – settings');
  };

  return (
    <>
      <PageHeading
        title="Create examination questions"
        desc="Author Multiple Choice and True/False questions with live LaTeX math rendering support."
      />

      <div className="form-layout">
        <div className="panel form-panel">
          <Stepper current={2} />

          <div className="section-title">
            <div>
              <h2>Examination Questions ({questions.length})</h2>
              <p>Add and configure the questions for your students.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                kind="outline"
                icon={BookOpen}
                onClick={() => setImportBankOpen(true)}
              >
                Question Bank
              </Button>
              <Button
                kind="outline"
                icon={Plus}
                onClick={openAddQuestion}
              >
                New Question
              </Button>
            </div>
          </div>

          <div className="question-editor-list">
            {questions.length === 0 ? (
              <p className="muted" style={{ padding: '24px', textAlign: 'center' }}>
                No questions added yet. Click "New Question" or select from "Question Bank".
              </p>
            ) : (
              questions.map((q, i) => (
                <div className="question-editor" key={q.id}>
                  <div className="question-number">Q{i + 1}</div>
                  <div className="question-text">
                    <b>
                      <LatexText text={q.text} />
                    </b>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                      <small style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {q.type} · {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                      </small>
                      {q.correctAnswer ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 8px',
                            borderRadius: '12px',
                            background: 'rgba(52, 211, 153, 0.12)',
                            color: '#34d399',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Confidential Answer Key - Hidden from students"
                        >
                          <Lock size={10} /> Key: Option {q.correctAnswer} (Confidential)
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 8px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          ⚠️ Missing Answer Key
                        </span>
                      )}
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {q.options.map(opt => (
                          <span
                            key={opt.id}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary, rgba(0,0,0,0.2))',
                              border: '1px solid var(--border-color, #2b354d)'
                            }}
                          >
                            <b style={{ color: opt.id === q.correctAnswer ? '#34d399' : undefined }}>
                              {opt.id}:
                            </b>{' '}
                            <LatexText text={opt.text} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => openEditQuestion(i)}
                    title="Edit question"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => deleteQuestion(i)}
                    title="Delete question"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <Button kind="outline" icon={Plus} onClick={openAddQuestion}>
              Add question
            </Button>
          </div>

          <div className="form-footer">
            <Button
              kind="outline"
              onClick={() => go('Create exam – general information')}
            >
              Back
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button kind="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Continue to settings <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>

        <aside className="side-note">
          <b>Question summary</b>
          <div className="summary-number">
            {questions.length} <small>questions</small>
          </div>
          <div className="summary-number">
            {totalMarks} <small>total marks</small>
          </div>
          <p>
            Supports inline math e.g. <code>{'$2x + 6 = 16$'}</code> and formulas e.g.{' '}
            <code>{'$\\frac{a}{b}$'}</code>, <code>{'$\\sqrt{x}$'}</code>.
          </p>
        </aside>
      </div>

      {/* Add / Edit Question Modal with LaTeX Editor */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={17} />
            </button>
            <h2>{editingIndex !== null ? 'Edit Question' : 'Add Question'}</h2>

            <label>Question Type (Choose or True/False)</label>
            <select
              className="field"
              value={qType}
              onChange={e => setQType(e.target.value as QuestionType)}
            >
              <option value="Multiple choice">Multiple choice (Choose)</option>
              <option value="True/false">True/false</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
              <label style={{ margin: 0 }}>Question Text (LaTeX Supported) *</label>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Code2 size={13} /> Wrap math in $...$
              </span>
            </div>

            {/* Quick LaTeX snippet toolbar */}
            <div
              style={{
                display: 'flex',
                gap: '5px',
                flexWrap: 'wrap',
                marginBottom: '8px',
                padding: '6px 8px',
                background: 'var(--bg-secondary, rgba(0,0,0,0.2))',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #2b354d)'
              }}
            >
              <span style={{ fontSize: '10px', alignSelf: 'center', color: '#94a3b8', marginRight: '4px' }}>
                Insert Math:
              </span>
              {[
                { label: 'x²', val: '$x^2$' },
                { label: '√x', val: '$\\sqrt{x}$' },
                { label: 'a/b', val: '$\\frac{a}{b}$' },
                { label: '±', val: '$\\pm$' },
                { label: 'π', val: '$\\pi$' },
                { label: '≤', val: '$\\le$' },
                { label: '≥', val: '$\\ge$' },
                { label: '×', val: '$\\times$' },
                { label: '∫', val: '$\\int_0^1 f(x) dx$' },
                { label: 'θ', val: '$\\theta$' }
              ].map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => insertLatex(item.val)}
                  style={{
                    padding: '3px 7px',
                    fontSize: '11px',
                    background: 'var(--card-bg, #1e2433)',
                    border: '1px solid var(--border-color, #3b4661)',
                    borderRadius: '4px',
                    color: 'var(--text-primary, #fff)',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <textarea
              className="field"
              rows={3}
              value={qText}
              onChange={e => setQText(e.target.value)}
              placeholder="e.g. What is the value of x in the equation $2x + 6 = 16$?"
            />

            {/* Live LaTeX Math Preview Box */}
            <div
              style={{
                marginTop: '6px',
                marginBottom: '14px',
                padding: '8px 12px',
                background: 'var(--bg-secondary, rgba(0,0,0,0.25))',
                border: '1px solid var(--border-color, #2b354d)',
                borderRadius: '6px',
                minHeight: '34px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <small style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>
                Live LaTeX Math Preview:
              </small>
              <LatexText
                text={qText || '(Live LaTeX math preview will appear here as you type)'}
                style={{ fontSize: '14px', color: qText ? 'inherit' : '#6b7280' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label>Marks for this Question *</label>
              <input
                type="number"
                className="field"
                min={1}
                value={qMarks}
                onChange={e => setQMarks(Number(e.target.value))}
              />
            </div>

            {qType === 'Multiple choice' && (
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <label>Options (Provide Choices A, B, C, D — LaTeX supported) *</label>
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={letter} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, width: '20px' }}>{letter}.</span>
                      <input
                        className="field"
                        value={qOptions[idx] || ''}
                        onChange={e => {
                          const copy = [...qOptions];
                          copy[idx] = e.target.value;
                          setQOptions(copy);
                        }}
                        placeholder={`Option ${letter} (e.g. 5 or $\\sqrt{2}$)`}
                      />
                    </div>
                    {qOptions[idx] && (qOptions[idx].includes('$') || qOptions[idx].includes('\\')) && (
                      <div style={{ marginLeft: '28px', marginTop: '2px', fontSize: '12px', color: '#94a3b8' }}>
                        Preview: <LatexText text={qOptions[idx]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Prominent Confidential Answer Key */}
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '10px',
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <label style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary, #f1f5f9)' }}>
                  <Key size={16} color="#818cf8" /> Question Answer Key *
                </label>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                >
                  <Lock size={11} /> Confidential (Students Cannot See)
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                Select the correct answer key for auto-grading. This key is strictly guarded and will never be exposed to students during the examination.
              </p>

              {qType === 'Multiple choice' ? (
                <select
                  className="field"
                  value={qCorrect}
                  onChange={e => setQCorrect(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="">-- Select Answer Key (Required) --</option>
                  <option value="A">Option A {qOptions[0] ? `(${qOptions[0].slice(0, 30)})` : ''}</option>
                  <option value="B">Option B {qOptions[1] ? `(${qOptions[1].slice(0, 30)})` : ''}</option>
                  <option value="C">Option C {qOptions[2] ? `(${qOptions[2].slice(0, 30)})` : ''}</option>
                  <option value="D">Option D {qOptions[3] ? `(${qOptions[3].slice(0, 30)})` : ''}</option>
                </select>
              ) : (
                <select
                  className="field"
                  value={qCorrect}
                  onChange={e => setQCorrect(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="">-- Select Answer Key (Required) --</option>
                  <option value="A">True (Option A)</option>
                  <option value="B">False (Option B)</option>
                </select>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <Button kind="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveQuestion}>
                {editingIndex !== null ? 'Save Changes' : 'Add to Exam'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Question Bank Import Dialog */}
      {importBankOpen && (
        <div className="modal-backdrop" onClick={() => setImportBankOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setImportBankOpen(false)}>
              <X size={17} />
            </button>
            <h2>Import from Question Bank</h2>
            <p className="muted">Click on a question to add it to this examination.</p>

            <div className="question-editor-list">
              {questionService.getAllQuestions().map(bq => (
                <div
                  className="question-editor"
                  key={bq.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => importFromBank(bq)}
                >
                  <div className="question-number">{bq.id}</div>
                  <div className="question-text">
                    <b>
                      <LatexText text={bq.text} />
                    </b>
                    <small>
                      {bq.subject} · {bq.type} · {bq.marks} marks · Key: Option {bq.correctAnswer || 'A'} (Confidential)
                    </small>
                  </div>
                  <Button kind="outline" icon={Plus}>
                    Add
                  </Button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <Button kind="outline" onClick={() => setImportBankOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
