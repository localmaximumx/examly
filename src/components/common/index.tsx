import React from 'react';
import { ArrowRight, Check, AlertCircle, X, LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Screen } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'primary' | 'outline' | 'danger';
  icon?: LucideIcon;
  block?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  kind = 'primary',
  icon: Icon,
  disabled = false,
  block = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn ${kind} ${block ? 'block' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'green' | 'blue' | 'purple' | 'orange' | 'gray';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'gray', className = '', style }) => {
  return <span className={`badge ${tone} ${className}`} style={style}>{children}</span>;
};

export interface PageHeadingProps {
  title: string;
  desc?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  desc,
  eyebrow,
  action
}) => {
  return (
    <div className="page-heading">
      <div>
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {desc ? <p>{desc}</p> : null}
      </div>
      {action}
    </div>
  );
};

export interface PanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, subtitle, children, action, className = '' }) => {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

export interface StatProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  tint: 'blue' | 'purple' | 'teal' | 'orange';
  footLabel?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  change,
  icon: Icon,
  tint,
  footLabel
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tint}`}>
        <Icon size={19} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change ? (
        <div className="stat-foot">
          <span className="trend">
            <ArrowRight size={13} />
            {change}
          </span>
          {footLabel ? <span>{footLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
};


const STEP_ROUTING: Record<number, Screen> = {
  1: 'Create exam – general information',
  2: 'Create exam – questions',
  3: 'Create exam – settings',
  4: 'Exam preview'
};

export interface StepperProps {
  current: number;
  steps?: string[];
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  current,
  steps = ['General info', 'Questions', 'Settings', 'Preview'],
  onStepClick
}) => {
  const { go } = useApp();

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick) {
      onStepClick(stepIndex);
    } else {
      const targetScreen = STEP_ROUTING[stepIndex];
      if (targetScreen) {
        go(targetScreen);
      }
    }
  };

  return (
    <div className="stepper" style={{ userSelect: 'none' }}>
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const isCurrent = current === stepNum;
        const isDone = current > stepNum;
        return (
          <div
            className={`step ${isCurrent ? 'current' : isDone ? 'done' : ''}`}
            key={s}
            onClick={() => handleStepClick(stepNum)}
            role="button"
            tabIndex={0}
            title={`Jump to Step ${stepNum}: ${s}`}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 10px',
              borderRadius: '7px',
              transition: 'background 0.15s, opacity 0.15s',
              opacity: isCurrent ? 1 : 0.85
            }}
          >
            <span>{isDone ? <Check size={13} /> : stepNum}</span>
            <b style={{ textDecoration: isCurrent ? 'none' : 'underline', textUnderlineOffset: '3px' }}>{s}</b>
            {i < steps.length - 1 && <i />}
          </div>
        );
      })}
    </div>
  );
};

export interface ToggleProps {
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  defaultChecked = false,
  checked,
  onChange
}) => {
  const [internalOn, setInternalOn] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internalOn;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = !isOn;
    if (!isControlled) {
      setInternalOn(next);
    }
    onChange?.(next);
  };

  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`toggle ${isOn ? 'on' : ''}`}
        onClick={handleClick}
        aria-label={`Toggle ${label}`}
      >
        <i />
      </button>
    </label>
  );
};

export interface ModalProps {
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  onClose,
  title = 'Confirm action',
  description = 'This is a sample confirmation dialog.',
  onConfirm,
  confirmLabel = 'Confirm',
  children
}) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          <AlertCircle size={22} />
        </div>
        <button className="modal-close" onClick={onClose}>
          <X size={17} />
        </button>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
        <div className="modal-actions">
          <Button kind="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { LatexText } from './LatexText';
export { CustomAlertModal } from './CustomAlertModal';
export type { CustomAlertOptions, AlertType } from './CustomAlertModal';

