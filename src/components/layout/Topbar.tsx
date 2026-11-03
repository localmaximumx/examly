import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Screen, UserRole } from '../../types';
import { storageService } from '../../services/storage.service';

interface CrumbItem {
  label: string;
  target?: Screen;
  onClick?: () => void;
}

const getBreadcrumbs = (
  screen: Screen,
  role: UserRole,
  classId?: string,
  selectedExamId?: string,
  selectedCompletedClass?: string | null,
  selectedSubmissionId?: string | null,
  onResetCompletedClass?: () => void
): CrumbItem[] => {
  if (role === 'Student') {
    switch (screen) {
      case 'Student home':
        return [{ label: 'Student portal' }, { label: 'Home' }];
      case 'Exam instructions':
        return [
          { label: 'Student portal', target: 'Student home' },
          { label: 'Examinations' },
          { label: 'Instructions' }
        ];
      case 'Main examination':
        return [
          { label: 'Student portal', target: 'Student home' },
          { label: 'Examinations' },
          { label: 'Active assessment' }
        ];
      case 'Connection interruption':
        return [
          { label: 'Student portal', target: 'Student home' },
          { label: 'Examinations' },
          { label: 'Connection status' }
        ];
      case 'Submission confirmation':
        return [
          { label: 'Student portal', target: 'Student home' },
          { label: 'Examinations' },
          { label: 'Submit confirmation' }
        ];
      case 'Submission receipt':
        return [
          { label: 'Student portal', target: 'Student home' },
          { label: 'Examinations' },
          { label: 'Receipt' }
        ];
      case 'Student examination history':
        return [{ label: 'Student portal', target: 'Student home' }, { label: 'Academic history' }];
      case 'Student result view':
        return [{ label: 'Student portal', target: 'Student home' }, { label: 'Results review' }];
      default:
        return [{ label: 'Student portal' }, { label: screen }];
    }
  }

  // Teacher role
  switch (screen) {
    case 'Teacher dashboard':
      return [{ label: 'Workspace' }, { label: 'Dashboard' }];
    case 'Examination list':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Examinations' }];
    case 'Create exam – general information':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Create exam' },
        { label: 'General info' }
      ];
    case 'Create exam – questions':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Create exam', target: 'Create exam – general information' },
        { label: 'Questions' }
      ];
    case 'Create exam – settings':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Create exam', target: 'Create exam – general information' },
        { label: 'Settings' }
      ];
    case 'Exam preview':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Preview' }
      ];
    case 'Exam details':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Details' }
      ];
    case 'Start examination confirmation':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Start confirmation' }
      ];
    case 'Live monitoring':
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Live monitoring' }
      ];
    case 'Results dashboard': {
      if (selectedCompletedClass) {
        return [
          { label: 'Workspace', target: 'Teacher dashboard' },
          { label: 'Examinations', target: 'Examination list' },
          {
            label: 'Results & performance',
            target: 'Results dashboard',
            onClick: onResetCompletedClass
          },
          { label: selectedCompletedClass }
        ];
      }
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        { label: 'Results & performance' }
      ];
    }
    case 'Individual result & grading': {
      const sub = selectedSubmissionId ? storageService.getSubmissions().find(s => s.id === selectedSubmissionId) : null;
      const studentLabel = sub?.studentName ? `${sub.studentName.split(' ')[0]} Evaluation` : 'Student evaluation';
      const classLabel = selectedCompletedClass || sub?.className;
      const list: CrumbItem[] = [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Examinations', target: 'Examination list' },
        {
          label: 'Results & performance',
          target: 'Results dashboard',
          onClick: onResetCompletedClass
        }
      ];
      if (classLabel) {
        list.push({ label: classLabel, target: 'Results dashboard' });
      }
      list.push({ label: studentLabel });
      return list;
    }
    case 'Question bank':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Question bank' }];
    case 'Students & classes':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Classes' }];
    case 'Class detail': {
      const cls = storageService.getClasses().find(c => c.id === classId || c.name === classId);
      return [
        { label: 'Workspace', target: 'Teacher dashboard' },
        { label: 'Classes', target: 'Students & classes' },
        { label: cls ? cls.name : 'Class details' }
      ];
    }
    case 'Reports':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Reports' }];
    case 'Settings':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Settings' }];
    case 'Activity log':
      return [{ label: 'Workspace', target: 'Teacher dashboard' }, { label: 'Activity log' }];
    default:
      return [{ label: 'Workspace' }, { label: screen }];
  }
};

export const Topbar: React.FC = () => {
  const {
    mobileOpen,
    setMobileOpen,
    role,
    screen,
    go,
    notify,
    selectedClassId,
    selectedExamId,
    selectedCompletedClass,
    setSelectedCompletedClass,
    selectedSubmissionId
  } = useApp();

  const handleResetCompletedClass = () => {
    setSelectedCompletedClass(null);
  };

  const crumbs = getBreadcrumbs(
    screen,
    role,
    selectedClassId,
    selectedExamId,
    selectedCompletedClass,
    selectedSubmissionId,
    handleResetCompletedClass
  );

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <button
          className="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="breadcrumb">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <span className="breadcrumb-sep">/</span>}
                {isLast ? (
                  <strong className="breadcrumb-current">{crumb.label}</strong>
                ) : crumb.target || crumb.onClick ? (
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => {
                      if (crumb.onClick) crumb.onClick();
                      if (crumb.target) go(crumb.target);
                    }}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="breadcrumb-item">{crumb.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="top-actions" style={{ marginLeft: 'auto' }}>
        <button
          className="icon-btn notification-btn"
          onClick={() => notify('Notifications: All systems operational. No unread alerts.')}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <i />
        </button>
      </div>
    </header>
  );
};
