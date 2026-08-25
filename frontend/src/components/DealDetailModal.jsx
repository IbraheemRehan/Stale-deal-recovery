import React, { useState } from 'react';
import {
  Building2,
  Send,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function DealDetailModal({
  deal,
  onClose,
  onTouchDeal,
  onEscalateDeal,
  touchingId,
  addToast,
  staleDays = 7
}) {
  const [touchForm, setTouchForm] = useState({
    activityType: 'RE_ENGAGEMENT_CALL',
    subject: 'Follow-up on Stalled Proposal',
    notes: 'Called customer to discuss timeline and address outstanding commercial questions.'
  });

  if (!deal) return null;

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onTouchDeal(deal.id, touchForm);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-panel__header" style={{ padding: '20px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={`badge ${deal.isStale ? 'badge-stale' : 'badge-active'} badge-lg`}>
                {deal.isStale ? `STALE (${deal.daysInactive}d)` : 'ACTIVE'}
              </span>
              <span className="badge badge-neutral">{deal.stage.replace(/_/g, ' ')}</span>
            </div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.3
            }}>
              {deal.title}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              <Building2 size={14} />
              <span>{deal.company} · <strong>{fmt(deal.amount)}</strong></span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-xs">
            <X size={18} />
          </button>
        </div>

        <div className="modal-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Contact & Owner Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            background: 'var(--bg-inset)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}>Primary Contact</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{deal.contactName}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{deal.contactEmail}</div>
              {deal.contactPhone && <div style={{ color: 'var(--text-tertiary)' }}>{deal.contactPhone}</div>}
            </div>
            <div>
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}>Assigned Rep</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{deal.ownerName}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{deal.ownerEmail}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                Follow-ups: {deal.followUpCount || 0}
              </div>
            </div>
          </div>

          {/* Stale Alert */}
          {deal.isStale && (
            <div style={{
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={17} color="var(--danger)" />
                <span>
                  <strong>Flagged Stale:</strong> No touch recorded for <strong>{deal.daysInactive} days</strong>
                  {' '}(threshold: {staleDays}d).
                </span>
              </div>
              {!deal.escalated && (
                <button
                  onClick={() => {
                    onEscalateDeal(deal.id, `Manual escalation: Untouched for ${deal.daysInactive} days.`);
                    onClose();
                  }}
                  className="btn btn-secondary btn-xs"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', flexShrink: 0 }}
                >
                  <ShieldAlert size={12} />
                  <span>Escalate to VP</span>
                </button>
              )}
            </div>
          )}

          {/* Recovery Touch Form */}
          <div style={{
            padding: '18px',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)'
          }}>
            <h3 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}>
              <Send size={15} color="var(--accent)" />
              Execute Recovery Touchpoint
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={touchForm.activityType}
                    onChange={(e) => setTouchForm(p => ({ ...p, activityType: e.target.value }))}
                    className="input-field select-field"
                  >
                    <option value="RE_ENGAGEMENT_CALL">Phone Call</option>
                    <option value="RE_ENGAGEMENT_EMAIL">Email Outreach</option>
                    <option value="EXECUTIVE_TOUCH">Executive Briefing</option>
                    <option value="DEMO_FOLLOWUP">Demo / Pricing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    value={touchForm.subject}
                    onChange={(e) => setTouchForm(p => ({ ...p, subject: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Outreach Notes & Outcome</label>
                <textarea
                  value={touchForm.notes}
                  onChange={(e) => setTouchForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={touchingId === deal.id}>
                  <CheckCircle2 size={13} />
                  <span>{touchingId === deal.id ? 'Re-activating…' : 'Log Touch & Remove Stale Flag'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity Trail */}
          <div>
            <h3 style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '10px'
            }}>
              Activity & Inactivity Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(deal.activities || []).length === 0 ? (
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  padding: '14px',
                  background: 'var(--bg-inset)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  No prior touches recorded. Deal created on {new Date(deal.createdAt).toLocaleDateString()}.
                </div>
              ) : (
                deal.activities.map(act => (
                  <div key={act.id} style={{
                    padding: '10px 14px',
                    background: 'var(--bg-inset)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    borderLeft: '3px solid var(--accent)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      <span>{act.subject || act.type}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
                      {act.notes}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
