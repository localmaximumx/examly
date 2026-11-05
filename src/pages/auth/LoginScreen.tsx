import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, ArrowRight, UserPlus, LogIn, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';
import { storageService } from '../../services/storage.service';

export const LoginScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  const { login, changeRole, notify, refreshData, activeTeacher, activeStudent } = useApp();

  // Check if accounts exist in database for this role
  const hasExistingAccounts = React.useMemo(() => {
    if (role === 'Teacher') {
      return storageService.getTeachers().length > 0;
    }
    return storageService.getStudents().length > 0;
  }, [role]);

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>(() => {
    return hasExistingAccounts ? 'login' : 'register';
  });

  // Inline error message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Synchronize state when role switches
  useEffect(() => {
    setUsername('');
    setPassword('');
    setErrorMessage(null);
    const hasAccounts = role === 'Teacher'
      ? storageService.getTeachers().length > 0
      : storageService.getStudents().length > 0;
    setAuthMode(hasAccounts ? 'login' : 'register');
  }, [role]);

  // Student registration form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGrade, setRegGrade] = useState('Grade 10');
  const [regSection, setRegSection] = useState('Section A');
  const [regStudentId, setRegStudentId] = useState(() => `STU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regPassword, setRegPassword] = useState('');

  // Teacher registration form state
  const [regTeacherName, setRegTeacherName] = useState('');
  const [regTeacherUsername, setRegTeacherUsername] = useState('');
  const [regTeacherPassword, setRegTeacherPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      const msg = 'Please enter your username.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }
    if (!password.trim()) {
      const msg = 'Please enter your password.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }

    const res = login(cleanUsername, role, password);
    if (!res.success && res.message) {
      setErrorMessage(res.message);
    }
  };

  const handleStudentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim()) {
      const msg = 'Please enter your full name.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }
    if (!regStudentId.trim()) {
      const msg = 'Please enter a student ID.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }
    if (!regPassword.trim()) {
      const msg = 'Please enter a password.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }

    const cleanUsername = (regUsername.trim() || regName.toLowerCase().replace(/\s+/g, '.')).toLowerCase();
    const cleanSection = regSection.replace(/^Section\s*/i, '').trim() || 'A';
    const computedClass = `${regGrade}${cleanSection}`;

    const res = authService.registerStudent({
      name: regName.trim(),
      studentId: regStudentId.trim(),
      username: cleanUsername,
      password: regPassword,
      gradeLevel: regGrade,
      section: cleanSection,
      className: computedClass
    });

    if (res.success && res.user) {
      refreshData();
      login(cleanUsername, 'Student', regPassword);
      notify(`Welcome, ${res.user.name}! Registered for ${regGrade} (${cleanSection}).`);
    } else {
      const msg = res.message || 'Registration failed.';
      setErrorMessage(msg);
      notify(msg);
    }
  };

  const handleTeacherRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regTeacherName.trim()) {
      const msg = 'Please enter your full name.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }
    const cleanUsername = (regTeacherUsername.trim() || regTeacherName.toLowerCase().replace(/\s+/g, '.')).toLowerCase();
    if (!regTeacherPassword.trim()) {
      const msg = 'Please enter a password.';
      setErrorMessage(msg);
      notify(msg);
      return;
    }

    const res = authService.registerTeacher({
      name: regTeacherName.trim(),
      username: cleanUsername,
      password: regTeacherPassword
    });

    if (res.success && res.user) {
      refreshData();
      login(cleanUsername, 'Teacher', regTeacherPassword);
      notify(`Welcome, ${res.user.name}! Teacher account registered successfully.`);
    } else {
      const msg = res.message || 'Teacher registration failed.';
      setErrorMessage(msg);
      notify(msg);
    }
  };

  // Other active session for quick switching in dev
  const otherSession = role === 'Teacher' ? activeStudent : activeTeacher;
  const otherRoleName = role === 'Teacher' ? 'Student' : 'Teacher';

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand login-brand">
          <div className="brand-mark">
            <GraduationCap size={23} />
          </div>
          <div>
            <strong>Examly</strong>
            <small>EXAM MANAGEMENT</small>
          </div>
        </div>

        <div className="login-art">
          <div className="art-circle">
            <GraduationCap size={39} />
          </div>
          <Sparkles className="art-spark" />
        </div>

        <Badge tone="blue">{role.toUpperCase()} PORTAL</Badge>
        <h1>
          {authMode === 'login'
            ? role === 'Teacher'
              ? 'Welcome back!'
              : 'Welcome, student!'
            : role === 'Teacher'
            ? 'Create teacher account'
            : 'Create student account'}
        </h1>
        <p>
          {authMode === 'login'
            ? role === 'Teacher'
              ? 'Sign in to access your teacher workspace.'
              : 'Sign in to access your examinations and portal.'
            : role === 'Teacher'
            ? 'Fill in your details to create a new teacher account.'
            : 'Fill in your full details to register in the school database.'}
        </p>

        {/* Quick session switch banner in development */}
        {otherSession && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '9px 12px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.28)',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              color: 'var(--text-primary, #fff)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <ArrowRightLeft size={14} style={{ color: 'var(--accent-blue, #818cf8)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Active {otherRoleName}: <b>{otherSession.name}</b>
              </span>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                background: 'var(--accent-blue, #6577e8)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
              onClick={() => changeRole(otherRoleName as UserRole)}
            >
              Switch to {otherRoleName} →
            </button>
          </div>
        )}

        {/* Inline Error Message Banner */}
        {errorMessage && (
          <div
            className="login-error-alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '12px',
              lineHeight: 1.45,
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, color: '#f87171' }} />
            <span style={{ flex: 1 }}>{errorMessage}</span>
          </div>
        )}

        {/* Sign In vs Create Account Toggle for both Teacher and Student */}
        <div
          style={{
            display: 'flex',
            background: 'var(--border-subtle, #182030)',
            padding: '3px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              border: 0,
              background: authMode === 'login' ? 'var(--bg-card, #232d44)' : 'transparent',
              color: authMode === 'login' ? 'var(--text-primary, #fff)' : 'var(--text-muted, #8292ab)',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
          >
            <LogIn size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
            Sign in
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              border: 0,
              background: authMode === 'register' ? 'var(--bg-card, #232d44)' : 'transparent',
              color: authMode === 'register' ? 'var(--text-primary, #fff)' : 'var(--text-muted, #8292ab)',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
          >
            <UserPlus size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
            Create account
          </button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <label>Username</label>
            <input
              className="field"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={role === 'Teacher' ? 'Enter teacher username' : 'Enter student username'}
            />

            <label>Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter your password"
            />

            <div className="login-row">
              <label className="remember">
                <input type="checkbox" defaultChecked /> Remember session
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  notify(
                    role === 'Teacher'
                      ? 'Click "Create account" to register a new teacher, or sign in with your username and password.'
                      : 'Click "Create account" to register a new student, or sign in with your username and password.'
                  )
                }
              >
                Need help?
              </button>
            </div>

            <Button block type="submit">
              Sign in <ArrowRight size={15} />
            </Button>
          </form>
        ) : role === 'Teacher' ? (
          /* Teacher Registration Form: Full Name, Username, Password */
          <form onSubmit={handleTeacherRegisterSubmit}>
            <label>Full Name *</label>
            <input
              className="field"
              value={regTeacherName}
              onChange={e => {
                setRegTeacherName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Bethlehem Worku"
              required
            />

            <label>Username *</label>
            <input
              className="field"
              value={regTeacherUsername}
              onChange={e => {
                setRegTeacherUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={regTeacherName ? regTeacherName.toLowerCase().replace(/\s+/g, '.') : 'e.g. bethlehem.worku'}
              required
            />

            <label>Password *</label>
            <input
              className="field"
              type="password"
              value={regTeacherPassword}
              onChange={e => {
                setRegTeacherPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Choose password"
              required
            />

            <div style={{ marginTop: '16px' }}>
              <Button block type="submit">
                <UserPlus size={15} /> Create Teacher Account
              </Button>
            </div>
          </form>
        ) : (
          /* Student Registration Form: Full Name, Class, Student ID, Password */
          <form onSubmit={handleStudentRegisterSubmit}>
            <label>Full Name *</label>
            <input
              className="field"
              value={regName}
              onChange={e => {
                setRegName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Dawit Haile"
              required
            />

            <label>Username (optional, auto-generated)</label>
            <input
              className="field"
              value={regUsername}
              onChange={e => {
                setRegUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={regName ? regName.toLowerCase().replace(/\s+/g, '.') : 'e.g. dawit.haile'}
            />

            <div className="two-fields">
              <div>
                <label>Grade Level</label>
                <select
                  className="field"
                  value={regGrade}
                  onChange={e => setRegGrade(e.target.value)}
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
              <div>
                <label>Section</label>
                <select
                  className="field"
                  value={regSection}
                  onChange={e => setRegSection(e.target.value)}
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>

            <div className="two-fields">
              <div>
                <label>Student ID *</label>
                <input
                  className="field"
                  value={regStudentId}
                  onChange={e => {
                    setRegStudentId(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. STU-1008"
                  required
                />
              </div>
              <div>
                <label>Password *</label>
                <input
                  className="field"
                  type="password"
                  value={regPassword}
                  onChange={e => {
                    setRegPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Choose password"
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Button block type="submit">
                <UserPlus size={15} /> Register & Enter Portal
              </Button>
            </div>
          </form>
        )}

        <small className="login-demo-note">
          Local Database Persistence · Sessions kept across role switches
        </small>
      </div>

      <div className="login-switch">
        <button
          type="button"
          onClick={() => changeRole('Teacher')}
          style={{ fontWeight: role === 'Teacher' ? 700 : 500 }}
        >
          Teacher portal {activeTeacher ? `(${activeTeacher.name.split(' ')[0]})` : ''}
        </button>
        <button
          type="button"
          onClick={() => changeRole('Student')}
          style={{ fontWeight: role === 'Student' ? 700 : 500 }}
        >
          Student portal {activeStudent ? `(${activeStudent.name.split(' ')[0]})` : ''}
        </button>
      </div>
    </div>
  );
};
