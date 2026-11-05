import React, { useState, useMemo } from 'react';
import {
  Plus,
  Users,
  GraduationCap,
  Clock3,
  BookOpen,
  ArrowRight,
  Search,
  X,
  School,
  Trash2
} from 'lucide-react';
import { PageHeading, Button, Stat, Panel, Badge } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage.service';
import { examService } from '../../services/exam.service';
import { ClassGroup } from '../../types';

export const StudentsClassesScreen: React.FC = () => {
  const { notify, showConfirm, user, dataVersion, refreshData, go, setSelectedClassId } = useApp();
  const [search, setSearch] = useState('');
  const [refreshToggle, setRefreshToggle] = useState(0);

  // Create Classroom Modal state
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState('2026/2027');

  const teacherUsername = user?.username || '';

  const classes = useMemo(() => {
    return storageService.getClasses();
  }, [refreshToggle, dataVersion]);

  const allStudents = useMemo(() => {
    return storageService.getStudents();
  }, [refreshToggle, dataVersion]);

  const teacherExams = useMemo(() => {
    return examService.getExamsForTeacher(teacherUsername);
  }, [teacherUsername, refreshToggle, dataVersion]);

  const invitations = useMemo(() => {
    return storageService.getClassInvitations();
  }, [refreshToggle, dataVersion]);

  // Filter classes by search query
  const filteredClasses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      c => c.name.toLowerCase().includes(q) || c.academicYear.toLowerCase().includes(q)
    );
  }, [classes, search]);

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      notify('Please enter a class name.');
      return;
    }
    const res = storageService.createClass(newClassName, newClassYear);
    if (!res.success) {
      notify(res.message);
      return;
    }
    notify(res.message);
    setNewClassName('');
    setCreateClassModalOpen(false);
    refreshData();
    setRefreshToggle(t => t + 1);

    if (res.classGroup) {
      setSelectedClassId(res.classGroup.id);
      go('Class detail');
    }
  };

  const handleOpenClass = (classId: string) => {
    setSelectedClassId(classId);
    go('Class detail');
  };

  const handleDeleteClass = (c: ClassGroup) => {
    showConfirm({
      title: 'Delete Classroom',
      message: `Are you sure you want to delete classroom "${c.name}"? Enrolled students will be moved to Unassigned status and invitations will be revoked.`,
      type: 'danger',
      confirmText: 'Delete Classroom',
      cancelText: 'Cancel',
      onConfirm: () => {
        const res = storageService.deleteClass(c.id);
        notify(res.message);
        refreshData();
        setRefreshToggle(t => t + 1);
      }
    });
  };

  const totalEnrolled = allStudents.filter(s => s.className && s.className !== 'Unassigned').length;
  const pendingInvitesCount = invitations.filter(i => i.status === 'Pending').length;

  return (
    <>
      <PageHeading
        title="Classes"
        desc="Organize your school by classrooms. Click on any class to add students by their unique ID."
        action={
          <Button
            kind="primary"
            icon={Plus}
            onClick={() => setCreateClassModalOpen(true)}
          >
            Create Classroom
          </Button>
        }
      />

      <div className="stats-grid">
        <Stat
          label="Active classrooms"
          value={classes.length}
          icon={GraduationCap}
          tint="purple"
        />
        <Stat
          label="Total enrolled students"
          value={totalEnrolled}
          icon={Users}
          tint="blue"
        />
        <Stat
          label="Active accounts"
          value={allStudents.filter(s => s.status === 'Active' && s.className && s.className !== 'Unassigned').length}
          icon={BookOpen}
          tint="teal"
        />
        <Stat
          label="Academic year"
          value="2026/2027"
          icon={Clock3}
          tint="teal"
        />
      </div>

      {/* Toolbar / Search */}
      <div className="toolbar" style={{ marginTop: '12px', marginBottom: '20px' }}>
        <div className="searchbox" style={{ flex: '1 1 300px' }}>
          <Search size={16} />
          <input
            placeholder="Search classrooms by name (e.g. Grade 10A, Physics Special)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Classroom Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}
      >
        {filteredClasses.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              background: 'var(--card-bg, #1e2433)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #2b354d)',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            No classrooms found matching "{search}".
          </div>
        ) : (
          filteredClasses.map(c => {
            const studentCount = allStudents.filter(
              s => s.className.toLowerCase() === c.name.toLowerCase()
            ).length;
            const classInvites = invitations.filter(
              i => i.className.toLowerCase() === c.name.toLowerCase() && i.status === 'Pending'
            ).length;
            const classExams = teacherExams.filter(
              e => e.className.toLowerCase() === c.name.toLowerCase()
            ).length;

            return (
              <div
                key={c.id}
                onClick={() => handleOpenClass(c.id)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: 'var(--card-bg, #1e2433)',
                  border: '1px solid var(--border-color, #2b354d)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                title={`Click to open ${c.name} classroom details`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #fff)' }}>
                          {c.name}
                        </h3>
                        <small style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>
                          Year {c.academicYear}
                        </small>
                      </div>
                    </div>
                    <Badge tone="blue">
                      {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                    </Badge>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: 'var(--text-secondary, #94a3b8)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary, #151a26)',
                      border: '1px solid var(--border-color, #2b354d)'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          display: 'inline-grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <BookOpen size={13} />
                      </span>
                      <b>{studentCount}</b> registered students in cohort
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color, #2b354d)'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
                    Managed by @{c.teacherUsername || teacherUsername}
                  </span>
                  <button
                    className="text-link"
                    style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenClass(c.id);
                    }}
                  >
                    Manage Class <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Classroom Modal */}
      {createClassModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateClassModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setCreateClassModalOpen(false)}>
              <X size={17} />
            </button>
            <h2>Create New Classroom</h2>
            <p className="muted" style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
              Create a classroom to organize students, invite members by username, and assign specific examinations.
            </p>

            <label>Classroom Name *</label>
            <input
              className="field"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="e.g. Grade 10C or Physics Special"
              autoFocus
            />

            <label>Academic Year</label>
            <input
              className="field"
              value={newClassYear}
              onChange={e => setNewClassYear(e.target.value)}
              placeholder="e.g. 2026/2027"
            />

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <Button kind="outline" onClick={() => setCreateClassModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>
                Create Classroom
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
