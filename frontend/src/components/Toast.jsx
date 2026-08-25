import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  const THEME = {
    success: { border: 'var(--success-border)', Icon: CheckCircle2, color: 'var(--success)' },
    error:   { border: 'var(--danger-border)',  Icon: AlertCircle,  color: 'var(--danger)' },
    warning: { border: 'var(--warning-border)', Icon: AlertTriangle, color: 'var(--warning)' },
    info:    { border: 'var(--accent-border)',   Icon: Info,          color: 'var(--accent)' }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 99999,
      maxWidth: '400px',
      width: '100%'
    }}>
      {toasts.map(toast => {
        const t = THEME[toast.type] || THEME.info;
        const Icon = t.Icon;

        return (
          <div
            key={toast.id}
            className="ent-card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              borderColor: t.border,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideIn 0.25s var(--ease-spring) forwards'
            }}
          >
            <Icon size={18} color={t.color} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginTop: '3px',
                  lineHeight: 1.4
                }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="btn btn-ghost btn-xs"
              style={{ padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
