import React from 'react';
import {
  Flame,
  Layers,
  AlertTriangle,
  CheckSquare,
  Users,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  Settings2
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  staleCount = 0,
  pendingTasksCount = 0,
  onRunScan,
  scanning,
  onOpenNewDealModal,
  onClearData,
  staleDays,
  onStaleDaysChange,
  onStaleDaysApply
}) {
  return (
    <header className="ent-card ent-card--elevated" style={{ padding: 0, overflow: 'hidden' }}>
      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 24px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)'
          }}>
            <Flame size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontWeight: 900,
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em'
              }}>
                Stale Deal Recovery
              </span>
              <span className="badge badge-active badge-lg">
                <ShieldCheck size={12} />
                {staleDays}-Day Scanner Active
              </span>
            </div>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
              letterSpacing: '-0.01em'
            }}>
              Automated Inactivity Detection • Auto-Task Engine • Re-engagement Console
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRunScan}
            className="btn btn-secondary btn-sm"
            disabled={scanning}
            title="Force an immediate stale deal scan"
          >
            <RefreshCw size={14} className={scanning ? 'spin-animation' : ''} />
            <span>{scanning ? 'Scanning…' : 'Scan Pipeline'}</span>
          </button>

          <button
            onClick={onOpenNewDealModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>New Deal</span>
          </button>

          <button
            onClick={onClearData}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-muted)' }}
            title="Reset pipeline and task logs"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 24px 12px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        {/* Tabs */}
        <nav className="pill-tabs">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pill-tab ${activeTab === 'kanban' ? 'pill-tab--active' : ''}`}
          >
            <Layers size={15} />
            <span>Pipeline Board</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pill-tab ${activeTab === 'watchlist' ? 'pill-tab--active' : ''}`}
            style={activeTab === 'watchlist' ? { color: 'var(--danger)' } : {}}
          >
            <AlertTriangle size={15} />
            <span>Stale Watchlist</span>
            {staleCount > 0 && (
              <span className="pill-tab__badge pill-tab__badge--danger">{staleCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pill-tab ${activeTab === 'tasks' ? 'pill-tab--active' : ''}`}
          >
            <CheckSquare size={15} />
            <span>Auto-Tasks</span>
            {pendingTasksCount > 0 && (
              <span className="pill-tab__badge pill-tab__badge--accent">{pendingTasksCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`pill-tab ${activeTab === 'team' ? 'pill-tab--active' : ''}`}
          >
            <Users size={15} />
            <span>Sales Team</span>
          </button>
        </nav>

        {/* Stale Threshold Config */}
        <div className="config-panel">
          <Settings2 size={15} color="var(--text-muted)" />
          <span className="config-panel__label">Stale Threshold:</span>
          <input
            type="number"
            min={1}
            max={90}
            value={staleDays}
            onChange={(e) => onStaleDaysChange(parseInt(e.target.value) || 7)}
            className="config-panel__input"
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>days</span>
          <button
            onClick={onStaleDaysApply}
            className="btn btn-primary btn-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </header>
  );
}
