import React, { useState } from 'react';
import { GraduationCap, Sparkles, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Badge, Button } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';

export const LoginScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  const { login, go, notify, refreshData } = useApp();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const defaultUser = role === 'Teacher' ? 'alemu.tadesse' : 'abel.tesfaye';
  const [username, setUsername] = useState(defaultUser);
  const [password, setPassword] = useState('examly-demo');

  // Student registration form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGrade, setRegGrade] = useState('Grade 10');
  const [regSection, setRegSection] = useState('Section A');
  const [regStudentId, setRegStudentId] = useState(() => `STU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regPassword, setRegPassword] = useState('examly-demo');

  // Teacher registration form state
  const [regTeacherName, setRegTeacherName] = useState('');
  const [regTeacherUsername, setRegTeacherUsername] = useState('');
  const [regTeacherPassword, setRegTeacherPassword] = useState('examly-demo');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      notify('Please enter a username.');
      return;
    }
    const success = login(username, role);
    if (!success) {
      if (role === 'Student') {
        notify('Student account not found in database. Please click "Create account".');
      } else {
        notify('Teacher account not found. Please click "Create account" to register.');
      }
    }
  };

  const handleStudentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      notify('Please enter your full name.');
      return;
    }
    if (!regStudentId.trim()) {
      notify('Please enter a student ID.');
      return;
    }
    if (!regPassword.trim()) {
      notify('Please enter a password.');
      return;
    }

    const cleanUsername = regUsername.trim() || regName.toLowerCase().replace(/\s+/g, '.');
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
      login(cleanUsername, 'Student');
      notify(`Welcome, ${res.user.name}! Registered in ${regGrade} (${cleanSection}).`);
      go('Student home');
    } else {
      notify(res.message || 'Registration failed.');
    }
  };

  const handleTeacherRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTeacherName.trim()) {
      notify('Please enter your full name.');
      return;
    }
    const cleanUsername = regTeacherUsername.trim() || regTeacherName.toLowerCase().replace(/\s+/g, '.');
    if (!regTeacherPassword.trim()) {
      notify('Please enter a password.');
      return;
    }

    const res = authService.registerTeacher({
      name: regTeacherName.trim(),
      username: cleanUsername,
      password: regTeacherPassword
    });

    if (res.success && res.user) {
      refreshData();
      login(cleanUsername, 'Teacher');
      notify(`Welcome, ${res.user.name}! Teacher account registered successfully.`);
      go('Teacher dashboard');
    } else {
      notify(res.message || 'Teacher registration failed.');
    }
  };

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
            onClick={() => setAuthMode('login')}
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
            onClick={() => setAuthMode('register')}
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
              onChange={e => setUsername(e.target.value)}
              placeholder={role === 'Teacher' ? 'e.g. alemu.tadesse' : 'e.g. abel.tesfaye'}
            />

            <label>Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <div className="login-row">
              <label className="remember">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  notify(
                    role === 'Teacher'
                      ? 'Teacher login: "alemu.tadesse" (password: examly-demo) or click "Create account"'
                      : 'Student login: "abel.tesfaye" (password: examly-demo) or click "Create account"'
                  )
                }
              >
                Need demo help?
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
                setRegTeacherUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
              }}
              placeholder="e.g. Bethlehem Worku"
              required
            />

            <label>Username *</label>
            <input
              className="field"
              value={regTeacherUsername}
              onChange={e => setRegTeacherUsername(e.target.value)}
              placeholder="e.g. bethlehem.worku"
              required
            />

            <label>Password *</label>
            <input
              className="field"
              type="password"
              value={regTeacherPassword}
              onChange={e => setRegTeacherPassword(e.target.value)}
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
          /* Student Registration Form: Full Name, Username, Grade & Section, ID, Password */
          <form onSubmit={handleStudentRegisterSubmit}>
            <label>Full Name *</label>
            <input
              className="field"
              value={regName}
              onChange={e => {
                setRegName(e.target.value);
                setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
              }}
              placeholder="e.g. Dawit Haile"
              required
            />

            <label>Username *</label>
            <input
              className="field"
              value={regUsername}
              onChange={e => setRegUsername(e.target.value)}
              placeholder="e.g. dawit.haile"
              required
            />

            <div className="two-fields">
              <div>
                <label>Grade *</label>
                <select
                  className="field"
                  value={regGrade}
                  onChange={e => setRegGrade(e.target.value)}
                  required
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
              <div>
                <label>Section *</label>
                <select
                  className="field"
                  value={regSection}
                  onChange={e => setRegSection(e.target.value)}
                  required
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                </select>
              </div>
            </div>

            <div className="two-fields">
              <div>
                <label>Student ID *</label>
                <input
                  className="field"
                  value={regStudentId}
                  onChange={e => setRegStudentId(e.target.value)}
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
                  onChange={e => setRegPassword(e.target.value)}
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
          Local Database Persistence · Accounts saved in browser database
        </small>
      </div>

      <div className="login-switch">
        <button onClick={() => { setAuthMode('login'); go('Teacher login'); }}>Teacher portal</button>
        <button onClick={() => { setAuthMode('login'); go('Student login'); }}>Student portal</button>
      </div>
    </div>
  );
};
