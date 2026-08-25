import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 99999,
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map(toast => {
        let bg = '#ffffff';
        let border = '#e2e8f0';
        let Icon = Info;
        let iconColor = '#2563eb';

        if (toast.type === 'success') {
          border = '#a7f3d0';
          Icon = CheckCircle2;
          iconColor = '#059669';
        } else if (toast.type === 'error') {
          border = '#fecaca';
          Icon = AlertCircle;
          iconColor = '#dc2626';
        } else if (toast.type === 'warning') {
          border = '#fde68a';
          Icon = AlertTriangle;
          iconColor = '#d97706';
        }

        return (
          <div
            key={toast.id}
            className="ent-card"
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: bg,
              borderColor: border,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideIn 0.2s ease forwards'
            }}
          >
            <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
