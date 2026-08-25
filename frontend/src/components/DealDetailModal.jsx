import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  DollarSign
} from 'lucide-react';

export default function DealDetailModal({ 
  deal, 
  onClose, 
  onTouchDeal, 
  onEscalateDeal,
  touchingId,
  addToast
}) {
  const [touchForm, setTouchForm] = useState({
    activityType: 'RE_ENGAGEMENT_CALL',
    subject: 'Follow-up on Stalled Proposal',
    notes: 'Called customer to discuss timeline and address any outstanding commercial questions.'
  });

  if (!deal) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleTouchSubmit = (e) => {
    e.preventDefault();
    onTouchDeal(deal.id, touchForm);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="ent-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${deal.isStale ? 'badge-stale' : 'badge-active'}`}>
                {deal.isStale ? `STALE (${deal.daysInactive}d untouched)` : 'ACTIVE'}
              </span>
              <span className="badge badge-neutral">{deal.stage}</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {deal.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <Building2 size={13} />
              <span>{deal.company} • <strong>{formatCurrency(deal.amount)}</strong></span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm">
            ✕
          </button>
        </div>

        {/* Prospect & Owner Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>PRIMARY CONTACT</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{deal.contactName}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{deal.contactEmail}</div>
            {deal.contactPhone && <div style={{ color: 'var(--text-secondary)' }}>{deal.contactPhone}</div>}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>ASSIGNED REP</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{deal.ownerName}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{deal.ownerEmail}</div>
            <div style={{ color: 'var(--text-muted)' }}>Follow-up count: {deal.followUpCount || 0}</div>
          </div>
        </div>

        {/* Inactivity Notice */}
        {deal.isStale && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.76rem', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <span>
                <strong>Flagged as Stale:</strong> No touch recorded for <strong>{deal.daysInactive} days</strong>.
              </span>
            </div>

            {!deal.escalated && (
              <button
                onClick={() => {
                  onEscalateDeal(deal.id, `Manual escalation: Untouched for ${deal.daysInactive} days.`);
                  onClose();
                }}
                className="btn btn-secondary btn-sm"
                style={{ background: '#ffffff', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                <ShieldAlert size={12} />
                <span>Escalate to VP</span>
              </button>
            )}
          </div>
        )}

        {/* Re-engagement Action Box */}
        <div className="ent-card" style={{ padding: '16px', background: '#ffffff', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} color="#2563eb" />
            <span>Execute Recovery Touchpoint</span>
          </h3>

          <form onSubmit={handleTouchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Touchpoint Type
                </label>
                <select
                  value={touchForm.activityType}
                  onChange={(e) => setTouchForm(prev => ({ ...prev, activityType: e.target.value }))}
                  className="input-field select-field"
                >
                  <option value="RE_ENGAGEMENT_CALL">Phone Call</option>
                  <option value="RE_ENGAGEMENT_EMAIL">Email Outreach</option>
                  <option value="EXECUTIVE_TOUCH">Executive Briefing</option>
                  <option value="DEMO_FOLLOWUP">Demo / Pricing Review</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Touchpoint Subject
                </label>
                <input
                  type="text"
                  value={touchForm.subject}
                  onChange={(e) => setTouchForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Outreach Notes &amp; Outcome
              </label>
              <textarea
                value={touchForm.notes}
                onChange={(e) => setTouchForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="input-field"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={touchingId === deal.id}>
                <CheckCircle2 size={12} />
                <span>{touchingId === deal.id ? 'Re-activating...' : 'Log Touch & Remove Stale Flag'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Activity Trail */}
        <div>
          <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Activity &amp; Inactivity Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(deal.activities || []).length === 0 ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '10px', background: '#f8fafc', borderRadius: '4px' }}>
                No prior touches recorded. Initial deal created on {new Date(deal.createdAt).toLocaleDateString()}.
              </div>
            ) : (
              deal.activities.map(act => (
                <div key={act.id} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '4px', fontSize: '0.74rem', borderLeft: '3px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#0f172a' }}>
                    <span>{act.subject || act.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{act.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
