import React from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

const STAGES = [
  { id: 'DISCOVERY',       label: 'Discovery',       color: '#6366f1', emoji: '🔍' },
  { id: 'PROPOSAL',        label: 'Proposal',         color: '#3b82f6', emoji: '📋' },
  { id: 'NEGOTIATION',     label: 'Negotiation',      color: '#f59e0b', emoji: '🤝' },
  { id: 'CONTRACT_REVIEW', label: 'Contract Review',  color: '#8b5cf6', emoji: '📝' },
  { id: 'CLOSED_WON',      label: 'Closed Won',       color: '#10b981', emoji: '🏆' }
];

export default function DealsKanban({ deals = [], onSelectDeal, onTouchDeal, touchingId }) {
  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const getStageDeals = (id) => deals.filter(d => d.stage === id);
  const getStageTotal = (id) => getStageDeals(id).reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      alignItems: 'start'
    }}>
      {STAGES.map(stage => {
        const stageDeals = getStageDeals(stage.id);
        const total = getStageTotal(stage.id);

        return (
          <div key={stage.id} className="kanban-column" style={{ borderTop: `3px solid ${stage.color}` }}>
            {/* Header */}
            <div className="kanban-column__header">
              <div>
                <h3 className="kanban-column__title">
                  <span style={{ marginRight: '6px' }}>{stage.emoji}</span>
                  {stage.label}
                </h3>
                <p className="kanban-column__meta">
                  {stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''} · {fmt(total)}
                </p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                {stageDeals.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stageDeals.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 16px', border: '1.5px dashed var(--border-default)' }}>
                  <p className="empty-state__desc" style={{ fontSize: '0.76rem' }}>
                    No deals in this stage
                  </p>
                </div>
              ) : (
                stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className={`deal-card ${deal.isStale ? 'deal-card--stale' : ''}`}
                  >
                    {/* Value & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: deal.isStale ? 'var(--danger)' : 'var(--text-primary)',
                        letterSpacing: '-0.02em'
                      }}>
                        {fmt(deal.amount)}
                      </span>
                      {deal.isStale ? (
                        <span className="badge badge-stale">
                          <AlertTriangle size={11} />
                          STALE ({deal.daysInactive}d)
                        </span>
                      ) : (
                        <span className="badge badge-active">
                          <CheckCircle2 size={11} />
                          {deal.daysInactive}d ago
                        </span>
                      )}
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h4 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.35,
                        marginBottom: '4px'
                      }}>
                        {deal.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.76rem',
                        color: 'var(--text-tertiary)'
                      }}>
                        <Building2 size={12} />
                        <span>{deal.company}</span>
                      </div>
                    </div>

                    {/* Escalation */}
                    {deal.escalated && (
                      <div style={{
                        background: 'var(--danger-subtle)',
                        border: '1px solid var(--danger-border)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        color: 'var(--danger-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ShieldAlert size={12} color="var(--danger)" />
                        <span><strong>Escalated</strong> to management</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="deal-card__footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div className="avatar avatar--slate avatar--sm">
                          {(deal.ownerName || 'SR').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
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
                              notes: 'Sales rep followed up to re-engage stalled prospect.'
                            });
                          }}
                          className="btn btn-primary btn-xs"
                          disabled={touchingId === deal.id}
                        >
                          <Send size={10} />
                          <span>{touchingId === deal.id ? 'Touching…' : 'Re-engage'}</span>
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
