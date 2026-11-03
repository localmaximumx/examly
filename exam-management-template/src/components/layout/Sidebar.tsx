import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  Activity,
  BarChart3,
  FileText,
  Timer,
  Users,
  FileBarChart,
  Settings,
  CircleHelp,
  ArrowRight,
  Home,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../../types';

interface NavItemDef {
  name: Screen;
  label?: string;
  icon: React.ComponentType<{ size: number }>;
  number: number;
}

const teacherNavGroups: { group: string; items: NavItemDef[] }[] = [
  {
    group: 'OVERVIEW',
    items: [
      { name: 'Teacher dashboard', icon: LayoutDashboard, number: 1 },
      { name: 'Examination list', icon: ClipboardList, number: 2 }
    ]
  },
  {
    group: 'SCHOOL MANAGEMENT',
    items: [
      { name: 'Students & classes', label: 'Classes', icon: Users, number: 3 },
      { name: 'Reports', icon: FileBarChart, number: 4 },
      { name: 'Settings', icon: Settings, number: 5 },
      { name: 'Activity log', icon: Activity, number: 6 }
    ]
  }
];

const studentNavItems: NavItemDef[] = [
  { name: 'Student home', label: 'Student home', icon: Home, number: 1 },
  { name: 'Student examination history', label: 'Examination history', icon: ClipboardList, number: 2 },
  { name: 'Student result view', label: 'Student result review', icon: BarChart3, number: 3 }
];

export const Sidebar: React.FC = () => {
  const { role, screen, mobileOpen, user, go, changeRole, logout, notify } = useApp();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Close user dropdown menu when clicking outside
  React.useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-container')) {
        setShowUserMenu(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <GraduationCap size={23} />
        </div>
        <div>
          <strong>Examly</strong>
          <small>EXAM MANAGEMENT</small>
        </div>
      </div>

      <div className="role-switch">
        <button
          type="button"
          className={role === 'Teacher' ? 'selected' : ''}
          onClick={(e) => {
            e.preventDefault();
            changeRole('Teacher');
          }}
        >
          Teacher
        </button>
        <button
          type="button"
          className={role === 'Student' ? 'selected' : ''}
          onClick={(e) => {
            e.preventDefault();
            changeRole('Student');
          }}
        >
          Student
        </button>
      </div>

      {role === 'Teacher' ? (
        teacherNavGroups.map(group => (
          <div className="nav-group" key={group.group}>
            <div className="nav-label">{group.group}</div>
            {group.items.map(item => {
              const isActive = screen === item.name || (item.name === 'Students & classes' && screen === 'Class detail');
              return (
                <button
                  key={item.name}
                  onClick={() => go(item.name)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={17} />
                  <span>{(item.label || item.name).replace(' – ', ' / ')}</span>
                </button>
              );
            })}
          </div>
        ))
      ) : (
        <div className="nav-group">
          <div className="nav-label">STUDENT PORTAL</div>
          {studentNavItems.map(item => (
            <button
              key={item.name}
              onClick={() => go(item.name)}
              className={`nav-item ${screen === item.name ? 'active' : ''}`}
            >
              <item.icon size={17} />
              <span>{item.label || item.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-bottom">
        <div className="profile-container" style={{ position: 'relative' }}>
          {showUserMenu && (
            <div
              className="user-menu-dropdown"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '2px',
                right: '2px',
                background: 'var(--card-bg, #1a202c)',
                border: '1px solid var(--border-color, #2d3748)',
                borderRadius: '10px',
                padding: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                zIndex: 100
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Need help section inside profile options */}
              <div
                className="help-card"
                style={{
                  margin: '0 0 10px',
                  padding: '12px',
                  background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #2d3748)'
                }}
              >
                <div
                  className="help-icon"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    color: 'var(--accent-blue, #818cf8)'
                  }}
                >
                  <CircleHelp size={16} />
                  <b style={{ fontSize: '13px', color: 'var(--text-primary, #fff)' }}>Need some help?</b>
                </div>
                <p style={{ margin: '4px 0 8px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
                  Visit our help center for guides, FAQs, and support.
                </p>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--accent-blue, #818cf8)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                  onClick={() => {
                    setShowUserMenu(false);
                    notify('Help center: Documentation & user guide available.');
                  }}
                >
                  Visit help center <ArrowRight size={13} />
                </button>
              </div>

              {/* Separator before Sign out */}
              <div style={{ height: '1px', background: 'var(--border-color, #2d3748)', margin: '8px 0' }} />

              {/* Sign out button */}
              <button
                className="user-menu-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease'
                }}
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}

          <div
            className="profile"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px' }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Click for profile options"
          >
            <div className="avatar">
              {user?.avatarText || (role === 'Teacher' ? 'AT' : 'AB')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.name || (role === 'Teacher' ? 'Alemu Tadesse' : 'Abel Tesfaye')}
              </strong>
              <small style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block' }}>
                {role} · {role === 'Teacher' ? 'Faculty Lead' : (user?.classId || 'Grade 10A')}
              </small>
            </div>
            <button
              type="button"
              className="icon-btn"
              style={{
                border: 0,
                background: showUserMenu ? 'var(--bg-secondary, rgba(255,255,255,0.1))' : 'transparent',
                color: showUserMenu ? 'var(--text-primary, #fff)' : 'var(--text-secondary, #94a3b8)',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              title="Profile menu"
              aria-label="Profile menu"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
