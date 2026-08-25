import React from 'react';
import { 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Clock,
  MoreVertical,
  ShieldAlert
} from 'lucide-react';

const STAGES = [
  { id: 'DISCOVERY', label: '1. Discovery Scoping', color: '#64748b' },
  { id: 'PROPOSAL', label: '2. Formal Proposal', color: '#2563eb' },
  { id: 'NEGOTIATION', label: '3. Terms Negotiation', color: '#d97706' },
  { id: 'CONTRACT_REVIEW', label: '4. Legal / Contract Review', color: '#7c3aed' },
  { id: 'CLOSED_WON', label: '5. Closed Won', color: '#059669' }
];

export default function DealsKanban({ deals = [], onSelectDeal, onTouchDeal, touchingId }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const getStageDeals = (stageId) => {
    return deals.filter(d => d.stage === stageId);
  };

  const getStageTotal = (stageId) => {
    return getStageDeals(stageId).reduce((sum, d) => sum + (d.amount || 0), 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'start' }}>
      {STAGES.map(stage => {
        const stageDeals = getStageDeals(stage.id);
        const stageTotal = getStageTotal(stage.id);

        return (
          <div 
            key={stage.id}
            className="ent-card"
            style={{
              background: '#f8fafc',
              borderTop: `3px solid ${stage.color}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '480px'
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  {stage.label}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {stageDeals.length} deals • {formatCurrency(stageTotal)}
                </span>
              </div>
            </div>

            {/* Deal Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stageDeals.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem', background: '#ffffff', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                  No deals in this stage
                </div>
              ) : (
                stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="ent-card"
                    style={{
                      padding: '14px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      borderLeft: deal.isStale ? '3.5px solid var(--status-stale)' : '1px solid var(--border-color)',
                      boxShadow: deal.isStale ? '0 2px 8px rgba(220, 38, 38, 0.08)' : 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Stale Flag & Deal Amount */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: deal.isStale ? 'var(--status-stale)' : '#0f172a' }}>
                        {formatCurrency(deal.amount)}
                      </span>

                      {deal.isStale ? (
                        <span className="badge badge-stale" title="Untouched for >= 7 days">
                          <AlertTriangle size={11} />
                          STALE ({deal.daysInactive}d)
                        </span>
                      ) : (
                        <span className="badge badge-active">
                          <CheckCircle2 size={11} />
                          {deal.daysInactive}d active
                        </span>
                      )}
                    </div>

                    {/* Deal Title & Company */}
                    <div>
                      <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                        {deal.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        <Building2 size={12} color="var(--text-muted)" />
                        <span>{deal.company}</span>
                      </div>
                    </div>

                    {/* Escalation Notice */}
                    {deal.escalated && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ShieldAlert size={12} color="#dc2626" />
                        <span><strong>Escalated:</strong> Manager alerted.</span>
                      </div>
                    )}

                    {/* Footer: Owner & Touch Action */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#e2e8f0',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569'
                        }}>
                          {(deal.ownerName || 'SR').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {deal.ownerName?.split(' ')[0]}
                        </span>
                      </div>

                      {deal.isStale && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTouchDeal(deal.id, {
                              type: 'RE_ENGAGEMENT_TOUCH',
                              subject: 'Direct Sales Rep Outreach',
                              notes: 'Sales rep followed up via phone/email to re-engage stalled prospect.'
                            });
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          disabled={touchingId === deal.id}
                        >
                          <Send size={10} />
                          <span>{touchingId === deal.id ? 'Touching...' : 'Re-engage'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
