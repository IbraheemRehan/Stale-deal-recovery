import React from 'react';
import { AlertCircle, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

export default function KPIHeader({ metrics = {}, staleDays = 7 }) {
  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const totalValue     = metrics.totalPipelineValue || 0;
  const atRiskValue    = metrics.atRiskPipelineValue || 0;
  const staleCount     = metrics.staleDealsCount || 0;
  const openCount      = metrics.openDealsCount || 0;
  const staleRate      = metrics.staleRatePct || 0;
  const pendingTasks   = metrics.pendingTasksCount || 0;
  const taskResolution = metrics.taskResolutionRate !== undefined ? metrics.taskResolutionRate : 100;
  const avgInactive    = metrics.avgInactiveDays || 0;

  const cards = [
    {
      variant: 'danger',
      label: 'At-Risk Pipeline',
      value: fmt(atRiskValue),
      valueDanger: true,
      icon: AlertCircle,
      badge: { text: `${staleRate}% of pipeline`, className: 'badge-stale' },
      detail: `in ${staleCount} stale deal${staleCount !== 1 ? 's' : ''}`
    },
    {
      variant: 'accent',
      label: 'Total Pipeline',
      value: fmt(totalValue),
      icon: DollarSign,
      badge: null,
      detail: `${openCount} active open deal${openCount !== 1 ? 's' : ''}`
    },
    {
      variant: 'warning',
      label: 'Avg Inactivity',
      value: `${avgInactive} Days`,
      icon: Clock,
      badge: { text: `Limit: ${staleDays} Days`, className: 'badge-warning' },
      detail: `auto-flags on day ${staleDays}`
    },
    {
      variant: 'success',
      label: 'Recovery Tasks',
      value: `${pendingTasks} Pending`,
      icon: CheckCircle2,
      badge: { text: `${taskResolution}% resolved`, className: 'badge-active' },
      detail: 'assigned to owners'
    }
  ];

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px'
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`ent-card kpi-card kpi-card--${card.variant}`}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span className="kpi-card__label">{card.label}</span>
              <div className={`kpi-card__icon-box kpi-card__icon-box--${card.variant}`}>
                <Icon size={18} color={`var(--${card.variant === 'accent' ? 'accent' : card.variant})`} />
              </div>
            </div>

            <div className={`kpi-card__value ${card.valueDanger ? 'kpi-card__value--danger' : ''}`}>
              {card.value}
            </div>

            <div className="kpi-card__detail">
              {card.badge && (
                <span className={`badge ${card.badge.className}`} style={{ fontSize: '0.68rem' }}>
                  {card.badge.text}
                </span>
              )}
              <span>{card.detail}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
