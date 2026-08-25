import React from 'react';
import {
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
    <header className="ent-card" style={{ padding: '12px 20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontWeight: 800,
            fontSize: '1.05rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em'
          }}>
            Stale Deal Recovery
          </span>
          <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={11} />
            {staleDays}d Limit
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="pill-tabs">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pill-tab ${activeTab === 'kanban' ? 'pill-tab--active' : ''}`}
          >
            <Layers size={14} />
            <span>Pipeline Board</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pill-tab ${activeTab === 'watchlist' ? 'pill-tab--active' : ''}`}
            style={activeTab === 'watchlist' ? { color: 'var(--danger)' } : {}}
          >
            <AlertTriangle size={14} />
            <span>Stale Watchlist</span>
            {staleCount > 0 && (
              <span className="pill-tab__badge pill-tab__badge--danger">{staleCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pill-tab ${activeTab === 'tasks' ? 'pill-tab--active' : ''}`}
          >
            <CheckSquare size={14} />
            <span>Auto-Tasks</span>
            {pendingTasksCount > 0 && (
              <span className="pill-tab__badge pill-tab__badge--accent">{pendingTasksCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`pill-tab ${activeTab === 'team' ? 'pill-tab--active' : ''}`}
          >
            <Users size={14} />
            <span>Sales Team</span>
          </button>
        </nav>

        {/* Right Section: Threshold & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Stale Threshold Stepper */}
          <div className="config-panel" style={{ padding: '4px 10px', gap: '8px' }}>
            <Settings2 size={13} color="var(--text-muted)" />
            <span className="config-panel__label" style={{ fontSize: '0.74rem' }}>Threshold:</span>
            <input
              type="number"
              min={1}
              max={90}
              value={staleDays}
              onChange={(e) => onStaleDaysChange(parseInt(e.target.value) || 7)}
              className="config-panel__input"
              style={{ width: '48px', padding: '3px 6px', fontSize: '0.78rem' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>days</span>
            <button
              onClick={onStaleDaysApply}
              className="btn btn-primary btn-xs"
              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
            >
              Set
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onRunScan}
            className="btn btn-secondary btn-sm"
            disabled={scanning}
            title="Force an immediate stale deal scan"
          >
            <RefreshCw size={13} className={scanning ? 'spin-animation' : ''} />
            <span>{scanning ? 'Scanning…' : 'Scan'}</span>
          </button>

          <button
            onClick={onOpenNewDealModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={13} />
            <span>New Deal</span>
          </button>

          <button
            onClick={onClearData}
            className="btn btn-ghost btn-xs"
            style={{ color: 'var(--text-muted)', padding: '6px' }}
            title="Reset pipeline and task logs"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
