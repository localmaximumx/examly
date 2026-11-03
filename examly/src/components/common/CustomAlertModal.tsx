import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface CustomAlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CustomAlertModalProps {
  alert: CustomAlertOptions | null;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ alert, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!alert) return;
      if (e.key === 'Escape') {
        if (alert.onCancel) alert.onCancel();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alert, onClose]);

  if (!alert) return null;

  const type = alert.type || 'info';

  const typeConfig: Record<
    AlertType,
    { icon: React.ComponentType<{ size: number; color?: string }>; color: string; bg: string; buttonKind: 'danger' | 'primary' }
  > = {
    danger: {
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      buttonKind: 'danger'
    },
    warning: {
      icon: AlertCircle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      buttonKind: 'primary'
    },
    success: {
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      buttonKind: 'primary'
    },
    info: {
      icon: Info,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      buttonKind: 'primary'
    }
  };

  const { icon: Icon, color, bg } = typeConfig[type];

  const handleConfirm = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleCancel}
    >
      <div
        className="modal custom-alert-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          background: 'var(--bg-panel, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '24px',
          position: 'relative',
          animation: 'fadeInScale 0.18s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary, #94a3b8)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: bg,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={24} color={color} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--text-primary, #f1f5f9)',
                lineHeight: 1.3
              }}
            >
              {alert.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-secondary, #94a3b8)',
                lineHeight: 1.5
              }}
            >
              {alert.message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
          }}
        >
          {alert.isConfirm && (
            <button
              onClick={handleCancel}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--border-color, #334155)',
                color: 'var(--text-primary, #f1f5f9)',
                transition: 'background 0.15s ease'
              }}
            >
              {alert.cancelText || 'Cancel'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background:
                type === 'danger'
                  ? '#ef4444'
                  : type === 'warning'
                  ? '#f59e0b'
                  : 'var(--accent-color, #4f46e5)',
              color: '#ffffff',
              transition: 'opacity 0.15s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {alert.confirmText || (alert.isConfirm ? 'Confirm' : 'OK')}
          </button>
        </div>
      </div>
    </div>
  );
};
