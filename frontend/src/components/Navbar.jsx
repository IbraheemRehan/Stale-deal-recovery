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
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  staleCount = 0, 
  pendingTasksCount = 0,
  onRunScan,
  scanning,
  onOpenNewDealModal,
  onClearData
}) {
  return (
    <header className="ent-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      {/* Brand & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
        }}>
          <Flame size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Stale Deal Recovery CRM
            </span>
            <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
              <ShieldCheck size={11} />
              7-Day Scanner Active
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
            Automated Inactivity Detection, Auto-Task Generation &amp; Re-engagement Engine
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
        <button
          onClick={() => setActiveTab('kanban')}
          className="btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            background: activeTab === 'kanban' ? '#ffffff' : 'transparent',
            color: activeTab === 'kanban' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'kanban' ? 'var(--shadow-sm)' : 'none',
            border: 'none'
          }}
        >
          <Layers size={14} />
          <span>Pipeline Board</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className="btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            background: activeTab === 'watchlist' ? '#ffffff' : 'transparent',
            color: activeTab === 'watchlist' ? '#dc2626' : '#64748b',
            boxShadow: activeTab === 'watchlist' ? 'var(--shadow-sm)' : 'none',
            border: 'none',
            fontWeight: activeTab === 'watchlist' ? 700 : 500
          }}
        >
          <AlertTriangle size={14} />
          <span>Stale Watchlist</span>
          {staleCount > 0 && (
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              {staleCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className="btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            background: activeTab === 'tasks' ? '#ffffff' : 'transparent',
            color: activeTab === 'tasks' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'tasks' ? 'var(--shadow-sm)' : 'none',
            border: 'none'
          }}
        >
          <CheckSquare size={14} />
          <span>Auto-Tasks</span>
          {pendingTasksCount > 0 && (
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className="btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            background: activeTab === 'team' ? '#ffffff' : 'transparent',
            color: activeTab === 'team' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'team' ? 'var(--shadow-sm)' : 'none',
            border: 'none'
          }}
        >
          <Users size={14} />
          <span>Sales Reps</span>
        </button>
      </nav>

      {/* Global Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={onRunScan} 
          className="btn btn-secondary btn-sm"
          disabled={scanning}
          title="Force an immediate 7-day stale deal scan"
        >
          <RefreshCw size={13} className={scanning ? 'spin-animation' : ''} />
          <span>{scanning ? 'Scanning...' : 'Scan Pipeline'}</span>
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
          className="btn btn-secondary btn-sm"
          style={{ color: '#94a3b8' }}
          title="Reset pipeline and task logs"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </header>
  );
}
