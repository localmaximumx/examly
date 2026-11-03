import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Upload, Download, Eye, Pencil, Trash2, X } from 'lucide-react';
import { PageHeading, Button, Panel, LatexText } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { questionService } from '../../services/question.service';
import { Question, QuestionType } from '../../types';
import { formatCSVFilename, downloadCSV } from '../../utils/csv.utils';

export const QuestionBankScreen: React.FC = () => {
  const { notify, showConfirm } = useApp();
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Modal for creating / editing / viewing question
  const [modalOpen, setModalOpen] = useState(false);
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Algebra');
  const [type, setType] = useState<QuestionType>('Multiple choice');
  const [marks, setMarks] = useState(2);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const [refreshToggle, setRefreshToggle] = useState(0);

  const questions = useMemo(() => {
    return questionService.searchQuestions(
      search,
      filterSubject,
      filterType,
      filterDifficulty
    );
  }, [search, filterSubject, filterType, filterDifficulty, refreshToggle]);

  const openAdd = () => {
    setViewQuestion(null);
    setEditingQuestionId(null);
    setText('');
    setSubject('Mathematics');
    setTopic('');
    setType('Multiple choice');
    setMarks(2);
    setDifficulty('Easy');
    setOptions(['', '', '', '']);
    setCorrectAnswer('A');
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setViewQuestion(null);
    setEditingQuestionId(q.id);
    setText(q.text);
    setSubject(q.subject || 'Mathematics');
    setTopic(q.topic || '');
    setType(q.type);
    setMarks(q.marks);
    setDifficulty(q.difficulty || 'Medium');
    setOptions(q.options?.map(o => o.text) || ['', '', '', '']);
    setCorrectAnswer(q.correctAnswer || 'A');
    setModalOpen(true);
  };

  const openView = (q: Question) => {
    setViewQuestion(q);
  };

  const handleSave = () => {
    if (!text.trim()) {
      notify('Please enter question text.');
      return;
    }

    const payload: Omit<Question, 'id'> = {
      questionNumber: 0,
      text,
      subject,
      topic,
      type,
      marks: Number(marks) || 1,
      difficulty,
      options:
        type === 'Multiple choice'
          ? options.map((opt, i) => ({ id: String.fromCharCode(65 + i), text: opt }))
          : type === 'True/false'
          ? [
              { id: 'A', text: 'True' },
              { id: 'B', text: 'False' }
            ]
          : undefined,
      correctAnswer
    };

    if (editingQuestionId) {
      questionService.updateQuestion({ ...payload, id: editingQuestionId });
      notify('Question bank entry updated.');
    } else {
      questionService.addQuestion(payload);
      notify('New question added to bank.');
    }

    setModalOpen(false);
    setRefreshToggle(t => t + 1);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question from the question bank? This will remove it from future exam imports.',
      type: 'danger',
      confirmText: 'Delete Question',
      onConfirm: () => {
        questionService.deleteQuestion(id);
        setRefreshToggle(t => t + 1);
        notify('Question deleted from bank.');
      }
    });
  };

  const handleExportQuestionsCSV = () => {
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'Question ID',
      'Type',
      'Subject',
      'Topic',
      'Difficulty',
      'Marks',
      'Question Text',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Answer Key'
    ];
    const rows = questions.map(q => {
      const optA = q.options?.find(o => o.id === 'A')?.text || '';
      const optB = q.options?.find(o => o.id === 'B')?.text || '';
      const optC = q.options?.find(o => o.id === 'C')?.text || '';
      const optD = q.options?.find(o => o.id === 'D')?.text || '';
      return [
        escapeCSV(q.id),
        escapeCSV(q.type),
        escapeCSV(q.subject || 'General'),
        escapeCSV(q.topic || 'General'),
        escapeCSV(q.difficulty || 'Medium'),
        escapeCSV(q.marks),
        escapeCSV(q.text),
        escapeCSV(optA),
        escapeCSV(optB),
        escapeCSV(optC),
        escapeCSV(optD),
        escapeCSV(q.correctAnswer || '')
      ];
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = formatCSVFilename('Question_Bank_Catalogue');
    downloadCSV(csv, filename);
    notify(`Exported ${questions.length} questions (${filename}).`);
  };

  return (
    <>
      <PageHeading
        title="Question bank"
        desc="Organize reusable questions by subject, topic, and difficulty."
        action={
          <Button icon={Plus} onClick={openAdd}>
            Add question
          </Button>
        }
      />

      <div className="toolbar">
        <div className="searchbox">
          <Search size={16} />
          <input
            placeholder="Search questions by text, subject, topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="field"
          style={{ width: '130px', height: '36px', padding: '0 8px' }}
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
        >
          <option value="All">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="English">English</option>
          <option value="Biology">Biology</option>
        </select>

        <select
          className="field"
          style={{ width: '130px', height: '36px', padding: '0 8px' }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Multiple choice">Multiple choice (Choose)</option>
          <option value="True/false">True/false</option>
        </select>

        <Button kind="outline" icon={Upload} onClick={() => notify('Import questions from CSV/DOCX is a demo action.')}>
          Import
        </Button>

        <Button kind="outline" icon={Download} onClick={handleExportQuestionsCSV}>
          Export CSV
        </Button>
      </div>

      <Panel
        title="Saved questions"
        subtitle={`${questions.length} reusable questions for future examinations`}
      >
        <div className="question-editor-list">
          {questions.length === 0 ? (
            <p className="muted" style={{ padding: '25px', textAlign: 'center' }}>
              No questions found matching your filter criteria.
            </p>
          ) : (
            questions.map(q => (
              <div className="question-editor" key={q.id}>
                <div className="question-number">{q.id}</div>
                <div className="question-text">
                  <b><LatexText text={q.text} /></b>
                  <small>
                    {q.subject || 'General'} · {q.topic || 'General'} · {q.difficulty || 'Medium'} ·{' '}
                    {q.marks} marks · {q.type}
                  </small>
                </div>
                <button
                  className="icon-btn"
                  title="View details"
                  onClick={() => openView(q)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="icon-btn"
                  title="Edit question"
                  onClick={() => openEdit(q)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="icon-btn"
                  title="Delete question"
                  onClick={e => handleDelete(q.id, e)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '560px' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={17} />
            </button>
            <h2>{editingQuestionId ? 'Edit Bank Question' : 'Add Bank Question'}</h2>

            <div className="two-fields">
              <div>
                <label>Subject</label>
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
                <label>Topic</label>
                <input
                  className="field"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Algebra"
                />
              </div>
            </div>

            <div className="two-fields">
              <div>
                <label>Question Type (Choose or True/False)</label>
                <select
                  className="field"
                  value={type}
                  onChange={e => setType(e.target.value as QuestionType)}
                >
                  <option value="Multiple choice">Multiple choice (Choose)</option>
                  <option value="True/false">True/false</option>
                </select>
              </div>
              <div>
                <label>Difficulty</label>
                <select
                  className="field"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <label>Question Prompt *</label>
            <textarea
              className="field"
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter question text..."
            />

            <div className="two-fields">
              <div>
                <label>Marks</label>
                <input
                  type="number"
                  className="field"
                  value={marks}
                  onChange={e => setMarks(Number(e.target.value))}
                />
              </div>
              <div>
                <label>Correct Answer</label>
                {type === 'Multiple choice' ? (
                  <select
                    className="field"
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value)}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                ) : type === 'True/false' ? (
                  <select
                    className="field"
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value)}
                  >
                    <option value="A">True (Option A)</option>
                    <option value="B">False (Option B)</option>
                  </select>
                ) : (
                  <input
                    className="field"
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value)}
                    placeholder="Reference answer"
                  />
                )}
              </div>
            </div>

            {type === 'Multiple choice' && (
              <div style={{ marginTop: '10px' }}>
                <label>Option Choices</label>
                {['A', 'B', 'C', 'D'].map((letter, i) => (
                  <div
                    key={letter}
                    style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}
                  >
                    <span style={{ fontWeight: 800, width: '20px' }}>{letter}.</span>
                    <input
                      className="field"
                      value={options[i] || ''}
                      onChange={e => {
                        const copy = [...options];
                        copy[i] = e.target.value;
                        setOptions(copy);
                      }}
                      placeholder={`Choice ${letter}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <Button kind="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save to Bank</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {viewQuestion && (
        <div className="modal-backdrop" onClick={() => setViewQuestion(null)}>
          <div
            className="modal"
            style={{ maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setViewQuestion(null)}>
              <X size={17} />
            </button>
            <h2>Question Details</h2>
            <p className="muted">
              {viewQuestion.subject} · {viewQuestion.topic} · {viewQuestion.difficulty}
            </p>

            <div style={{ padding: '12px 0' }}>
              <h3>{viewQuestion.text}</h3>
              {viewQuestion.options && (
                <div style={{ marginTop: '10px' }}>
                  {viewQuestion.options.map(o => (
                    <div
                      key={o.id}
                      className="answer-preview"
                      style={{
                        borderColor:
                          viewQuestion.correctAnswer === o.id ? '#6577e8' : undefined,
                        background:
                          viewQuestion.correctAnswer === o.id ? '#f4f6ff' : undefined
                      }}
                    >
                      <b>{o.id}.</b> {o.text}{' '}
                      {viewQuestion.correctAnswer === o.id && (
                        <span style={{ color: '#6577e8', fontWeight: 800, marginLeft: '8px' }}>
                          (Correct)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {viewQuestion.explanation && (
                <p className="muted" style={{ marginTop: '10px' }}>
                  <b>Explanation:</b> {viewQuestion.explanation}
                </p>
              )}
            </div>

            <div className="modal-actions">
              <Button onClick={() => setViewQuestion(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
