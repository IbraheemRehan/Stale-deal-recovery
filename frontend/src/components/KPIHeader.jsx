import React from 'react';
import { DollarSign, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function KPIHeader({ metrics = {} }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const totalValue = metrics.totalPipelineValue || 0;
  const atRiskValue = metrics.atRiskPipelineValue || 0;
  const staleCount = metrics.staleDealsCount || 0;
  const openCount = metrics.openDealsCount || 0;
  const staleRate = metrics.staleRatePct || 0;
  const pendingTasks = metrics.pendingTasksCount || 0;
  const taskResolutionRate = metrics.taskResolutionRate !== undefined ? metrics.taskResolutionRate : 100;
  const avgInactiveDays = metrics.avgInactiveDays || 0;

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
      {/* 1. At-Risk Pipeline Value */}
      <div className="ent-card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--status-stale)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            At-Risk Pipeline
          </span>
          <div style={{ padding: '6px', background: 'var(--status-stale-subtle)', borderRadius: '6px' }}>
            <AlertCircle size={16} color="var(--status-stale)" />
          </div>
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-stale)', letterSpacing: '-0.02em' }}>
          {formatCurrency(atRiskValue)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span className="badge badge-stale" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
            {staleRate}% of Pipeline
          </span>
          <span>in {staleCount} stale deals</span>
        </div>
      </div>

      {/* 2. Total Open Pipeline */}
      <div className="ent-card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Pipeline
          </span>
          <div style={{ padding: '6px', background: 'var(--accent-primary-subtle)', borderRadius: '6px' }}>
            <DollarSign size={16} color="var(--accent-primary)" />
          </div>
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {formatCurrency(totalValue)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>{openCount} active negotiation deals</span>
        </div>
      </div>

      {/* 3. Average Inactivity Period */}
      <div className="ent-card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--status-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avg Inactivity
          </span>
          <div style={{ padding: '6px', background: 'var(--status-warning-subtle)', borderRadius: '6px' }}>
            <Clock size={16} color="var(--status-warning)" />
          </div>
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {avgInactiveDays} Days
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
            Limit: 7 Days
          </span>
          <span>auto-flags on day 7</span>
        </div>
      </div>

      {/* 4. Auto-Generated Tasks Pending */}
      <div className="ent-card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--status-active)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recovery Tasks
          </span>
          <div style={{ padding: '6px', background: 'var(--status-active-subtle)', borderRadius: '6px' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
          </div>
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {pendingTasks} Actionable
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
            {taskResolutionRate}% Resolution
          </span>
          <span>assigned to owners</span>
        </div>
      </div>
    </section>
  );
}
