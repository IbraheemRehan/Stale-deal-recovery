import React from 'react';
import {
  AlertTriangle,
  Send,
  ShieldAlert,
  Eye,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function StaleWatchlistTable({
  staleDeals = [],
  onSelectDeal,
  onTouchDeal,
  onEscalateDeal,
  touchingId,
  staleDays = 7
}) {
  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="ent-card slide-up" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 0' }}>
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="section-header__title">
                🚨 Stale Deal Inactivity Watchlist
              </h2>
              <span className="badge badge-stale badge-lg">
                {staleDeals.length} At-Risk
              </span>
            </div>
            <p className="section-header__subtitle">
              Deals exceeding the {staleDays}-day inactivity threshold. Automated follow-up tasks have been dispatched to assigned owners.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 24px' }}>
        {staleDeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" style={{ background: 'var(--success-subtle)' }}>
              <CheckCircle size={22} color="var(--success)" />
            </div>
            <h3 className="empty-state__title">Pipeline Hygiene is Pristine</h3>
            <p className="empty-state__desc">
              No open deals have been untouched for {staleDays} or more days. Your team is crushing it.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal / Prospect</th>
                  <th>Stage</th>
                  <th>Pipeline Value</th>
                  <th>Inactivity</th>
                  <th>Owner</th>
                  <th>Escalation</th>
                  <th style={{ textAlign: 'right' }}>Recovery</th>
                </tr>
              </thead>
              <tbody>
                {staleDeals.map(deal => (
                  <tr key={deal.id}>
                    {/* Deal */}
                    <td style={{ cursor: 'pointer' }} onClick={() => onSelectDeal(deal)}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {deal.title}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)'
                      }}>
                        <Building2 size={11} />
                        <span>{deal.company} · {deal.contactName}</span>
                      </div>
                    </td>

                    {/* Stage */}
                    <td>
                      <span className="badge badge-neutral">{deal.stage.replace(/_/g, ' ')}</span>
                    </td>

                    {/* Value */}
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '0.88rem' }}>
                        {fmt(deal.amount)}
                      </span>
                    </td>

                    {/* Inactivity */}
                    <td>
                      <span className="badge badge-stale" style={{ fontWeight: 800 }}>
                        <Clock size={11} />
                        {deal.daysInactive}d untouched
                      </span>
                    </td>

                    {/* Owner */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar--indigo avatar--sm">
                          {(deal.ownerName || 'SR').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {deal.ownerName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {deal.ownerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Escalation */}
                    <td>
                      {deal.escalated ? (
                        <span className="badge badge-stale">
                          <ShieldAlert size={11} />
                          Manager Alerted
                        </span>
                      ) : (
                        <button
                          onClick={() => onEscalateDeal(deal.id, `Deal untouched for ${deal.daysInactive} days in ${deal.stage}.`)}
                          className="btn btn-secondary btn-xs"
                          title="Alert sales manager via Slack & Email"
                        >
                          <ShieldAlert size={11} color="var(--warning)" />
                          <span>Escalate</span>
                        </button>
                      )}
                    </td>

                    {/* Recovery */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => onSelectDeal(deal)}
                          className="btn btn-ghost btn-xs"
                          title="View Full Dossier"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onTouchDeal(deal.id, {
                            type: 'RE_ENGAGEMENT_CALL',
                            subject: 'Sales Outreach Follow-up',
                            notes: 'Spoke directly with prospect. Deal re-activated.'
                          })}
                          className="btn btn-primary btn-xs"
                          disabled={touchingId === deal.id}
                        >
                          <Send size={11} />
                          <span>{touchingId === deal.id ? 'Re-engaging…' : 'Re-engage & Clear'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
