import React from 'react';
import { 
  AlertTriangle, 
  Send, 
  ShieldAlert, 
  Eye, 
  Mail, 
  Phone, 
  Building2, 
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function StaleWatchlistTable({ 
  staleDeals = [], 
  onSelectDeal, 
  onTouchDeal, 
  onEscalateDeal,
  touchingId 
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="ent-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              🚨 Stale Deal Inactivity Watchlist (≥ 7 Days Untouched)
            </h2>
            <span className="badge badge-stale">
              {staleDeals.length} Deals At-Risk
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            These deals have exceeded the 7-day inactivity threshold without a rep touchpoint. Automated follow-up tasks have been dispatched.
          </p>
        </div>
      </div>

      {/* Table */}
      {staleDeals.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--status-active-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <AlertTriangle size={20} color="var(--status-active)" />
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Pipeline Hygiene is Pristine!
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            No open deals have been untouched for 7 or more days.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <th style={{ padding: '10px 12px' }}>Deal / Prospect</th>
                <th style={{ padding: '10px 12px' }}>Stage</th>
                <th style={{ padding: '10px 12px' }}>Pipeline Value</th>
                <th style={{ padding: '10px 12px' }}>Inactivity</th>
                <th style={{ padding: '10px 12px' }}>Assigned Owner</th>
                <th style={{ padding: '10px 12px' }}>Escalation</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Recovery Action</th>
              </tr>
            </thead>
            <tbody>
              {staleDeals.map(deal => (
                <tr 
                  key={deal.id} 
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Deal / Company */}
                  <td style={{ padding: '12px', cursor: 'pointer' }} onClick={() => onSelectDeal(deal)}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {deal.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <Building2 size={11} />
                      <span>{deal.company} • {deal.contactName}</span>
                    </div>
                  </td>

                  {/* Stage */}
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-neutral">
                      {deal.stage}
                    </span>
                  </td>

                  {/* Pipeline Value */}
                  <td style={{ padding: '12px', fontWeight: 800, color: 'var(--status-stale)' }}>
                    {formatCurrency(deal.amount)}
                  </td>

                  {/* Inactivity */}
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-stale" style={{ fontWeight: 800 }}>
                        <Clock size={11} />
                        {deal.daysInactive} Days Untouched
                      </span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
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
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.76rem' }}>
                          {deal.ownerName}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {deal.ownerEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Escalation */}
                  <td style={{ padding: '12px' }}>
                    {deal.escalated ? (
                      <span className="badge badge-stale" style={{ fontSize: '0.68rem' }}>
                        <ShieldAlert size={11} />
                        Manager Alerted
                      </span>
                    ) : (
                      <button
                        onClick={() => onEscalateDeal(deal.id, `Deal untouched for ${deal.daysInactive} days in ${deal.stage}.`)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        title="Alert sales manager via Slack & Email"
                      >
                        <ShieldAlert size={11} color="#d97706" />
                        <span>Escalate</span>
                      </button>
                    )}
                  </td>

                  {/* Recovery Action */}
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => onSelectDeal(deal)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 8px' }}
                        title="View Full Dossier"
                      >
                        <Eye size={12} />
                      </button>

                      <button
                        onClick={() => onTouchDeal(deal.id, {
                          type: 'RE_ENGAGEMENT_CALL',
                          subject: 'Sales Outreach Follow-up',
                          notes: 'Spoke directly with prospect. Deal re-activated.'
                        })}
                        className="btn btn-primary btn-sm"
                        disabled={touchingId === deal.id}
                      >
                        <Send size={11} />
                        <span>{touchingId === deal.id ? 'Re-engaging...' : 'Re-engage & Clear'}</span>
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
  );
}
