import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  UserCheck,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { PageHeading, Button, Stat, Panel, Badge } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { Student } from '../../types';

export const ClassDetailScreen: React.FC = () => {
  const { go, notify, showConfirm, user, dataVersion, refreshData, selectedClassId } = useApp();
  const [refreshToggle, setRefreshToggle] = useState(0);

  // Tab state: 'search' (default) | 'paste'
  const [activeTab, setActiveTab] = useState<'paste' | 'search'>('search');

  // Paste IDs state
  const [pasteIdsText, setPasteIdsText] = useState('');
  const [validatedResult, setValidatedResult] = useState<{
    valid: Student[];
    notFound: string[];
    alreadyInClass: Student[];
  } | null>(null);

  // Search ID state
  const [searchQuery, setSearchQuery] = useState('');

  const classes = useMemo(() => {
    return storageService.getClasses();
  }, [refreshToggle, dataVersion]);

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId || c.name === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const allStudents = useMemo(() => {
    return storageService.getStudents();
  }, [refreshToggle, dataVersion]);

  // Students enrolled in this specific classroom
  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return allStudents.filter(
      s => s.className && s.className.toLowerCase() === selectedClass.name.toLowerCase()
    );
  }, [allStudents, selectedClass]);

  // Real-time matched student for Search tab
  const searchedStudent = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return storageService.findStudentById(searchQuery.trim()) || null;
  }, [searchQuery, allStudents]);

  // --- Handlers ---
  const handleValidatePasteIds = () => {
    if (!pasteIdsText.trim()) {
      notify('Please enter one or more student IDs to validate.');
      return;
    }

    // Split by newlines, commas, spaces
    const tokens = pasteIdsText
      .split(/[\r\n, ]+/)
      .map(t => t.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      notify('No valid IDs found in input.');
      return;
    }

    const uniqueTokens = Array.from(new Set(tokens));
    const valid: Student[] = [];
    const notFound: string[] = [];
    const alreadyInClass: Student[] = [];

    uniqueTokens.forEach(id => {
      const student = storageService.findStudentById(id);
      if (!student) {
        notFound.push(id);
      } else if (
        student.className &&
        selectedClass &&
        student.className.toLowerCase() === selectedClass.name.toLowerCase()
      ) {
        alreadyInClass.push(student);
      } else {
        valid.push(student);
      }
    });

    setValidatedResult({ valid, notFound, alreadyInClass });
  };

  const handleEnrollValidatedStudents = () => {
    if (!selectedClass || !validatedResult || validatedResult.valid.length === 0) return;

    const idsToEnroll = validatedResult.valid.map(s => s.studentId || s.id);
    const res = storageService.enrollStudentsToClassByIds(
      selectedClass.id,
      selectedClass.name,
      idsToEnroll
    );

    notify(`Successfully enrolled ${res.enrolled.length} student${res.enrolled.length === 1 ? '' : 's'} into ${selectedClass.name}!`);
    setPasteIdsText('');
    setValidatedResult(null);
    refreshData();
    setRefreshToggle(t => t + 1);
  };

  const handleEnrollSingleStudent = (student: Student) => {
    if (!selectedClass) return;

    const res = storageService.enrollStudentsToClassByIds(
      selectedClass.id,
      selectedClass.name,
      [student.studentId || student.id]
    );

    notify(`Enrolled ${student.name} into ${selectedClass.name}!`);
    setSearchQuery('');
    refreshData();
    setRefreshToggle(t => t + 1);
  };

  const handleRemoveStudentFromClass = (studentId: string, sName: string) => {
    showConfirm({
      title: 'Remove Student from Classroom',
      message: `Are you sure you want to remove "${sName}" from ${selectedClass?.name}? The student will be set to Unassigned until reassigned.`,
      type: 'danger',
      confirmText: 'Remove from Class',
      onConfirm: () => {
        const students = storageService.getStudents();
        const student = students.find(s => s.id === studentId || s.studentId === studentId);
        if (student) {
          student.className = 'Unassigned';
          storageService.saveStudents(students);

          // Clean up any active session/join requests for this student
          const requests = storageService.getJoinRequests();
          const cleanRequests = requests.filter(
            r => r.studentId !== studentId && r.studentId !== student.studentId && r.studentId !== student.id
          );
          storageService.saveJoinRequests(cleanRequests);

          refreshData();
          setRefreshToggle(t => t + 1);
          window.dispatchEvent(new Event('storage'));
          notify(`${sName} was removed from ${selectedClass?.name}.`);
        }
      }
    });
  };

  if (!selectedClass) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Classroom not found</h2>
        <Button onClick={() => go('Students & classes')}>Return to Classes</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        title={selectedClass.name}
        desc={`Classroom cohort management for academic year ${selectedClass.academicYear}. Add students by their unique ID to authorize them.`}
        action={
          <Badge tone="purple" style={{ fontSize: '13px', padding: '6px 14px' }}>
            Academic Year {selectedClass.academicYear}
          </Badge>
        }
      />

      {/* Classroom Metrics */}
      <div className="stats-grid">
        <Stat
          label="Enrolled students"
          value={studentsInClass.length}
          icon={Users}
          tint="blue"
        />
        <Stat
          label="Active accounts"
          value={studentsInClass.filter(s => s.status === 'Active').length}
          icon={ShieldCheck}
          tint="teal"
        />
        <Stat
          label="Academic Year"
          value={selectedClass.academicYear}
          icon={GraduationCap}
          tint="purple"
        />
      </div>

      {/* ENROLLED STUDENTS ROSTER PANEL */}
      <Panel
        title={`Enrolled students in ${selectedClass.name} (${studentsInClass.length})`}
        subtitle="All students in this classroom are automatically authorized to take examinations assigned to this class"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>STUDENT ID</th>
                <th>USERNAME</th>
                <th>GRADE (PROFILE)</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {studentsInClass.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary, #94a3b8)' }}>
                    <Users size={26} color="#818cf8" style={{ display: 'block', margin: '0 auto 8px' }} />
                    <b>No students currently enrolled in {selectedClass.name}</b>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                      Use the "Search by ID" or "Paste IDs" tool below to add students by their ID.
                    </p>
                  </td>
                </tr>
              ) : (
                studentsInClass.map(s => (
                  <tr key={s.id || s.studentId}>
                    <td>
                      <b>{s.name}</b>
                    </td>
                    <td>
                      <Badge tone="purple" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {s.studentId || s.id}
                      </Badge>
                    </td>
                    <td>@{s.username}</td>
                    <td>
                      <Badge tone="blue" style={{ fontSize: '11px', padding: '2px 7px' }}>
                        {s.gradeLevel || (s.className?.match(/Grade\s*\d+/i)?.[0] || 'Grade 10')}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={s.status === 'Active' ? 'green' : 'gray'}>
                        <CheckCircle2 size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                        {s.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        title={`Remove ${s.name} from ${selectedClass.name}`}
                        onClick={() => handleRemoveStudentFromClass(s.id || s.studentId, s.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ADD STUDENTS TO CLASSROOM (COMPACT PANEL AT BOTTOM) */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'var(--card-bg, #1e2433)',
          border: '1px solid var(--border-color, #2b354d)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
              Add students to classroom
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
              Enroll students into <b>{selectedClass.name}</b> by searching their ID or pasting multiple IDs.
              <span style={{ display: 'block', marginTop: '2px', color: '#818cf8', fontSize: '11px' }}>
                ℹ️ Note: Enrolling a student assigns them to this classroom cohort; their primary grade level is permanently anchored to their user profile.
              </span>
            </p>
          </div>

          {/* Compact Tab switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #2b354d)'
            }}
          >
            <button
              onClick={() => {
                setActiveTab('search');
                setValidatedResult(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'search' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'search' ? '#818cf8' : 'var(--text-secondary, #94a3b8)'
              }}
            >
              Search by ID
            </button>
            <button
              onClick={() => {
                setActiveTab('paste');
                setValidatedResult(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'paste' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'paste' ? '#818cf8' : 'var(--text-secondary, #94a3b8)'
              }}
            >
              Paste IDs
            </button>
          </div>
        </div>

        {/* TAB 1: SEARCH BY ID */}
        {activeTab === 'search' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '440px', marginBottom: searchQuery.trim() ? '12px' : '0' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'var(--text-secondary, #94a3b8)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
                <input
                  type="text"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 14px 0 36px',
                    margin: 0,
                    borderRadius: '8px',
                    background: 'var(--field-bg, #121724)',
                    border: '1px solid var(--border-color, #2b354d)',
                    color: 'var(--text-primary, #f1f5f9)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter student ID (e.g. STU-1001)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Live Search Result Card */}
            {searchQuery.trim() && (
              searchedStudent ? (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-color, #2b354d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    maxWidth: '650px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
                    >
                      {searchedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: 'var(--text-primary, #f1f5f9)' }}>
                        {searchedStudent.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                        ID: <b style={{ color: '#818cf8' }}>{searchedStudent.studentId || searchedStudent.id}</b> · @{searchedStudent.username}
                      </p>
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
                          Profile Grade Level:
                        </span>
                        <Badge tone="purple" style={{ fontSize: '11px', padding: '1px 6px' }}>
                          {searchedStudent.gradeLevel || (searchedStudent.className?.match(/Grade\s*\d+/i)?.[0] || 'Grade 10')}
                        </Badge>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
                          Current Class: <b>{searchedStudent.className || 'Unassigned'}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {searchedStudent.className && searchedStudent.className.toLowerCase() === selectedClass.name.toLowerCase() ? (
                      <Badge tone="green">
                        <CheckCircle2 size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                        Already in {selectedClass.name}
                      </Badge>
                    ) : (
                      <Button
                        kind="primary"
                        icon={UserPlus}
                        onClick={() => handleEnrollSingleStudent(searchedStudent)}
                      >
                        Enroll into {selectedClass.name}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(230, 160, 93, 0.1)',
                    border: '1px solid rgba(230, 160, 93, 0.25)',
                    color: '#e6a05d',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    maxWidth: '500px'
                  }}
                >
                  <AlertCircle size={15} />
                  No registered student found matching ID "{searchQuery.trim()}".
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: PASTE IDS */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              rows={3}
              value={pasteIdsText}
              onChange={e => {
                setPasteIdsText(e.target.value);
                setValidatedResult(null);
              }}
              placeholder="Paste student IDs separated by newlines, commas, or spaces (e.g. STU-1001, STU-1002)..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(10, 14, 23, 0.7)',
                border: '1px solid var(--border-color, #2b354d)',
                color: 'var(--text-primary, #f1f5f9)',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.4',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
              <Button kind="outline" onClick={handleValidatePasteIds}>
                Validate student IDs
              </Button>
              {pasteIdsText && (
                <button
                  className="text-link"
                  style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}
                  onClick={() => {
                    setPasteIdsText('');
                    setValidatedResult(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Validation Outcome Box */}
            {validatedResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-color, #2b354d)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge tone={validatedResult.valid.length > 0 ? 'green' : 'gray'}>
                      {validatedResult.valid.length} Valid IDs Ready
                    </Badge>
                    {validatedResult.alreadyInClass.length > 0 && (
                      <Badge tone="blue">
                        {validatedResult.alreadyInClass.length} Already in {selectedClass.name}
                      </Badge>
                    )}
                    {validatedResult.notFound.length > 0 && (
                      <Badge tone="orange">
                        {validatedResult.notFound.length} Not Found
                      </Badge>
                    )}
                  </div>
                  {validatedResult.valid.length > 0 && (
                    <Button
                      kind="primary"
                      icon={UserPlus}
                      onClick={handleEnrollValidatedStudents}
                    >
                      Enroll {validatedResult.valid.length} Students Now
                    </Button>
                  )}
                </div>

                {/* Valid students preview */}
                {validatedResult.valid.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '4px' }}>
                      Ready to enroll:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {validatedResult.valid.map(st => (
                        <span
                          key={st.id}
                          style={{
                            fontSize: '11px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: 'rgba(52, 211, 153, 0.12)',
                            border: '1px solid rgba(52, 211, 153, 0.25)',
                            color: '#34d399'
                          }}
                        >
                          {st.name} ({st.studentId || st.id})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
</>
  );
};
