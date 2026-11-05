import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  User,
  Lock,
  Mail,
  Hash,
  AtSign,
  Eye,
  EyeOff,
  FileText,
  Clock,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';
import './auth-layout.css';

export const LoginScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();
  const { login, notify } = useApp();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form field states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student register states
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGrade, setRegGrade] = useState('Grade 10');
  const [regSection, setRegSection] = useState('Section A');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Teacher register states
  const [regTeacherName, setRegTeacherName] = useState('');
  const [regTeacherUsername, setRegTeacherUsername] = useState('');
  const [regTeacherEmail, setRegTeacherEmail] = useState('');
  const [regTeacherPassword, setRegTeacherPassword] = useState('');

  // Reset errors and inputs on role or mode change
  useEffect(() => {
    setErrorMessage(null);
    setUsername('');
    setPassword('');
    setShowPassword(false);
  }, [role, authMode]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      const msg = role === 'Teacher' ? 'Please enter your username or email.' : 'Please enter your username.';
      setErrorMessage(msg);
      return;
    }
    if (!password.trim()) {
      const msg = 'Please enter your password.';
      setErrorMessage(msg);
      return;
    }

    const res = login(cleanUsername, role, password);
    if (!res.success && res.message) {
      setErrorMessage(res.message);
    }
  };

  // Handle Student Registration
  const handleStudentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const sectionLetter = regSection.replace(/^Section\s*/i, '').trim();
    const requestedClass = `${regGrade}${sectionLetter}`;

    const res = authService.registerStudent({
      name: regName.trim(),
      studentId: regStudentId.trim() || undefined,
      username: regUsername.trim(),
      password: regPassword,
      gradeLevel: regGrade,
      section: regSection,
      requestedClass: requestedClass,
      className: 'Unassigned' // Pending approval: teacher must approve before class membership
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
      return;
    }

    notify(`Student account created! Requested enrollment for ${requestedClass}.`);
    // Sign in automatically
    login(regUsername.trim(), 'Student', regPassword);
  };

  // Handle Teacher Registration
  const handleTeacherRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regTeacherName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regTeacherUsername.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (regTeacherPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const res = authService.registerTeacher({
      name: regTeacherName.trim(),
      username: regTeacherUsername.trim(),
      password: regTeacherPassword
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
      return;
    }

    notify(`Teacher account created! Welcome ${res.user?.name}.`);
    // Sign in automatically
    login(regTeacherUsername.trim(), 'Teacher', regTeacherPassword);
  };

  // Simulated Google Auth
  const handleGoogleAuth = () => {
    notify('Google single sign-on is configured for enterprise domains.');
  };

  // Navigate to alternate portal
  const handleSwitchPortal = () => {
    if (role === 'Student') {
      navigate('/login/teacher');
    } else {
      navigate('/login/student');
    }
  };

  // Hero Content configuration based on Role & AuthMode
  const heroContent = React.useMemo(() => {
    if (role === 'Student') {
      if (authMode === 'login') {
        return {
          title: 'Welcome back to your learning space',
          subtitle: 'Access your exams, review feedback, and track your academic progress all in one place.',
          features: [
            {
              icon: FileText,
              title: 'Clean testing environment',
              desc: 'Focused, distraction-free exam interface designed for best performance.'
            },
            {
              icon: Clock,
              title: 'Instant results & feedback',
              desc: 'View your scores and detailed answer breakdowns as soon as exams are graded.'
            },
            {
              icon: BarChart3,
              title: 'Progress tracking',
              desc: 'Monitor your performance trends and growth across all subjects over time.'
            }
          ]
        };
      } else {
        return {
          title: 'Start your academic journey with Examly',
          subtitle: 'Join thousands of students who prepare for exams with clarity, track growth, and achieve their goals.',
          features: [
            {
              icon: FileText,
              title: 'Seamless exam access',
              desc: 'Take scheduled exams online with real-time autosave and no data loss.'
            },
            {
              icon: Clock,
              title: 'Transparent grading',
              desc: 'Understand your strengths with clear point breakdowns per section.'
            },
            {
              icon: BarChart3,
              title: 'Class collaboration',
              desc: 'Stay aligned with your teachers and classmates through centralized announcements.'
            }
          ]
        };
      }
    } else {
      // Teacher
      if (authMode === 'login') {
        return {
          title: 'Empowering educators, elevating assessments',
          subtitle: 'Create exams with AI assistance, monitor student progress in real-time, and streamline grading effortlessly.',
          features: [
            {
              icon: Sparkles,
              title: 'AI-powered exam generator',
              desc: 'Generate comprehensive questions from syllabus topics in seconds.'
            },
            {
              icon: Clock,
              title: 'Real-time anti-cheat monitoring',
              desc: 'Track student activity, tab switches, and completion status live.'
            },
            {
              icon: BarChart3,
              title: 'Automated grading & insights',
              desc: 'Auto-grade objective questions and generate detailed performance analytics.'
            }
          ]
        };
      } else {
        return {
          title: 'Join educators transforming their classrooms',
          subtitle: 'Spend less time grading and more time teaching. Build exams, automate evaluations, and support your students.',
          features: [
            {
              icon: FileText,
              title: 'Smart question creation',
              desc: 'Author multiple-choice, short-answer, and essay questions with built-in rubrics.'
            },
            {
              icon: Clock,
              title: 'Instant distribution',
              desc: 'Publish exams to specific classes with custom time windows and access controls.'
            },
            {
              icon: BarChart3,
              title: 'Actionable analytics',
              desc: 'Identify learning gaps early with question-level difficulty and mastery reports.'
            }
          ]
        };
      }
    }
  }, [role, authMode]);

  return (
    <div className="examly-auth-screen">
      {/* LEFT 50%: HERO BANNER */}
      <div className="examly-auth-hero">
        {/* Brand header */}
        <div className="examly-auth-brand">
          <div className="examly-auth-logo-box">
            <GraduationCap size={26} />
          </div>
          <div className="examly-auth-brand-text">
            <h2>Examly</h2>
            <span>EXAM MANAGEMENT</span>
          </div>
        </div>

        {/* Hero center description */}
        <div className="examly-auth-hero-center">
          <h1 className="examly-auth-hero-title">{heroContent.title}</h1>
          <p className="examly-auth-hero-subtitle">{heroContent.subtitle}</p>

          <div className="examly-auth-features">
            {heroContent.features.map((feat, idx) => (
              <div className="examly-auth-feature-row" key={idx}>
                <div className="examly-auth-feature-icon">
                  <feat.icon size={20} />
                </div>
                <div className="examly-auth-feature-text">
                  <b>{feat.title}</b>
                  <p>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watermark Graduation Cap SVG */}
        <div className="examly-auth-watermark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Hero Footer */}
        <div style={{ zIndex: 2, fontSize: '12px', color: '#64748b' }}>
          © 2026 Examly. All rights reserved.
        </div>
      </div>

      {/* RIGHT 50%: FORM PANEL */}
      <div className="examly-auth-form-panel">
        <div className="examly-auth-form-wrapper">
          {/* Top bar: Portal Badge & Switch link */}
          <div className="examly-auth-topbar">
            <div className="examly-auth-portal-badge">
              {role === 'Teacher' ? 'TEACHER PORTAL' : 'STUDENT PORTAL'}
            </div>
            <button
              type="button"
              className="examly-auth-role-link"
              onClick={handleSwitchPortal}
            >
              {role === 'Teacher' ? "I'm a student →" : "I'm a teacher →"}
            </button>
          </div>

          {/* Form Header */}
          <div className="examly-auth-header">
            <h1>{authMode === 'login' ? 'Sign in' : 'Create account'}</h1>
            <p>
              {authMode === 'login'
                ? 'Welcome back! Enter your details to continue.'
                : role === 'Teacher'
                ? 'Set up your educator workspace in seconds.'
                : 'Get started with your student profile in seconds.'}
            </p>
          </div>

          {/* Inline Error Banner */}
          {errorMessage && (
            <div className="examly-auth-error-banner">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {authMode === 'login' && (
            <form className="examly-auth-form" onSubmit={handleLoginSubmit}>
              <div className="examly-auth-field">
                <label>
                  {role === 'Teacher' ? 'Username or Email' : 'Username'}
                </label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder={
                      role === 'Teacher'
                        ? 'e.g. alex.miller or teacher@school.edu'
                        : 'e.g. jdoe or student ID'
                    }
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Password</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="examly-auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="examly-auth-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Row: Remember Me & Forgot Password */}
              <div className="examly-auth-row-extras">
                <label className="examly-auth-checkbox-label">
                  <input
                    type="checkbox"
                    className="examly-auth-checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="examly-auth-forgot-link"
                  onClick={e => {
                    e.preventDefault();
                    notify('Password recovery instruction has been sent to school faculty.');
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit CTA */}
              <button type="submit" className="examly-auth-submit-btn">
                {role === 'Teacher' ? 'Sign in to Dashboard →' : 'Sign in →'}
              </button>

              {/* Divider */}
              <div className="examly-auth-divider">or</div>

              {/* Social Login Button */}
              <button
                type="button"
                className="examly-auth-google-btn"
                onClick={handleGoogleAuth}
              >
                <span className="examly-auth-google-icon">G</span>
                <span>Continue with Google</span>
              </button>

              {/* Toggle to Create Account */}
              <div className="examly-auth-footer-toggle">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="examly-auth-toggle-link"
                  onClick={() => setAuthMode('register')}
                >
                  Create account
                </button>
              </div>

              <div className="examly-auth-subfooter">
                By signing in, you agree to our Terms of Service & Privacy Policy
              </div>
            </form>
          )}

          {/* MODE: CREATE ACCOUNT (STUDENT) */}
          {authMode === 'register' && role === 'Student' && (
            <form className="examly-auth-form" onSubmit={handleStudentRegisterSubmit}>
              <div className="examly-auth-field">
                <label>Full Name</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder="e.g. Jane Doe"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Username</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <AtSign size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder="e.g. janedoe"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Two columns: Grade Level & Section */}
              <div className="examly-auth-two-cols">
                <div className="examly-auth-field">
                  <label>Grade Level</label>
                  <select
                    className="examly-auth-select"
                    value={regGrade}
                    onChange={e => setRegGrade(e.target.value)}
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="examly-auth-field">
                  <label>Section</label>
                  <select
                    className="examly-auth-select"
                    value={regSection}
                    onChange={e => setRegSection(e.target.value)}
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="examly-auth-field">
                <label>
                  Student ID <span className="optional">(optional)</span>
                </label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <Hash size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder="e.g. STU-2024-001"
                    value={regStudentId}
                    onChange={e => setRegStudentId(e.target.value)}
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Password</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="examly-auth-input"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="examly-auth-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="examly-auth-helper-text">Must be at least 6 characters</span>
              </div>

              <button type="submit" className="examly-auth-submit-btn">
                Create student account →
              </button>

              <div className="examly-auth-divider">or</div>

              <button
                type="button"
                className="examly-auth-google-btn"
                onClick={handleGoogleAuth}
              >
                <span className="examly-auth-google-icon">G</span>
                <span>Sign up with Google</span>
              </button>

              <div className="examly-auth-footer-toggle">
                Already have an account?{' '}
                <button
                  type="button"
                  className="examly-auth-toggle-link"
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
              </div>

              <div className="examly-auth-subfooter">
                By creating an account, you agree to our Terms of Service & Privacy Policy
              </div>
            </form>
          )}

          {/* MODE: CREATE ACCOUNT (TEACHER) */}
          {authMode === 'register' && role === 'Teacher' && (
            <form className="examly-auth-form" onSubmit={handleTeacherRegisterSubmit}>
              <div className="examly-auth-field">
                <label>Full Name</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder="e.g. Dr. Alex Miller"
                    value={regTeacherName}
                    onChange={e => setRegTeacherName(e.target.value)}
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Username</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <AtSign size={18} />
                  </div>
                  <input
                    type="text"
                    className="examly-auth-input"
                    placeholder="e.g. amiller"
                    value={regTeacherUsername}
                    onChange={e => setRegTeacherUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Work Email</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="examly-auth-input"
                    placeholder="e.g. alex.miller@school.edu"
                    value={regTeacherEmail}
                    onChange={e => setRegTeacherEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="examly-auth-field">
                <label>Password</label>
                <div className="examly-auth-input-wrapper">
                  <div className="examly-auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="examly-auth-input"
                    placeholder="Create a strong password"
                    value={regTeacherPassword}
                    onChange={e => setRegTeacherPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="examly-auth-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="examly-auth-helper-text">Must be at least 6 characters</span>
              </div>

              <button type="submit" className="examly-auth-submit-btn">
                Create teacher account →
              </button>

              <div className="examly-auth-divider">or</div>

              <button
                type="button"
                className="examly-auth-google-btn"
                onClick={handleGoogleAuth}
              >
                <span className="examly-auth-google-icon">G</span>
                <span>Sign up with Google</span>
              </button>

              <div className="examly-auth-footer-toggle">
                Already have an account?{' '}
                <button
                  type="button"
                  className="examly-auth-toggle-link"
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
              </div>

              <div className="examly-auth-subfooter">
                By creating an account, you agree to our Terms of Service & Privacy Policy
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
