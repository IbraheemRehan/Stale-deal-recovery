import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Copy,
  Check,
  X
} from 'lucide-react';

export default function AutoTasksDrawer({ tasks = [], onCompleteTask, completingTaskId, addToast, staleDays = 7 }) {
  const [filter, setFilter] = useState('ALL');
  const [draftModalTask, setDraftModalTask] = useState(null);
  const [copied, setCopied] = useState(false);

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const filtered = tasks.filter(t => {
    if (filter === 'PENDING') return t.status === 'PENDING';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;

  const generateDraft = (task) =>
    `Subject: Checking in regarding ${task.dealTitle || 'our recent discussion'}\n\nHi ${task.contactName || 'there'},\n\nI wanted to follow up on our previous scoping discussion regarding ${task.dealTitle}.\n\nWe've recently helped teams similar to ${task.company} streamline their workflows and achieve significant ROI within the first 30 days.\n\nAre you available for a brief 10-minute check-in this Thursday at 2:00 PM EST to address any open questions regarding the proposal?\n\nBest regards,\n${task.ownerName}\n${task.ownerEmail}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast?.({ type: 'success', title: 'Copied', message: 'AI re-engagement draft copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ent-card slide-up" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 0' }}>
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="section-header__title">📋 Recovery Tasks</h2>
              <span className="badge badge-accent badge-lg">{pendingCount} Pending</span>
            </div>
            <p className="section-header__subtitle">
              Auto-generated when a deal exceeds {staleDays} days of inactivity. Each task is assigned to the deal owner for immediate action.
            </p>
          </div>

          {/* Filter */}
          <div className="pill-tabs" style={{ alignSelf: 'flex-start' }}>
            {['ALL', 'PENDING', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pill-tab ${filter === f ? 'pill-tab--active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div style={{ padding: '0 24px 24px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" style={{ background: 'var(--success-subtle)' }}>
              <CheckCircle2 size={22} color="var(--success)" />
            </div>
            <h3 className="empty-state__title">All Clear</h3>
            <p className="empty-state__desc">
              No tasks match the selected filter. Your pipeline is healthy.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(task => {
              const done = task.status === 'COMPLETED';
              const priorityColor =
                task.priority === 'URGENT' ? 'var(--danger)' :
                task.priority === 'HIGH' ? 'var(--warning)' :
                'var(--accent)';

              return (
                <div
                  key={task.id}
                  className="ent-card"
                  style={{
                    padding: '16px 20px',
                    borderLeft: `4px solid ${done ? 'var(--success)' : priorityColor}`,
                    opacity: done ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  {/* Info */}
                  <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <h3 style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: done ? 'line-through' : 'none',
                        lineHeight: 1.35
                      }}>
                        {task.title}
                      </h3>
                      <span
                        className={`badge ${task.priority === 'URGENT' ? 'badge-stale' : task.priority === 'HIGH' ? 'badge-warning' : 'badge-neutral'}`}
                        style={{ fontSize: '0.66rem' }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '10px',
                      lineHeight: 1.45
                    }}>
                      {task.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={12} />
                        <span>{task.company} ({fmt(task.dealAmount)})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>Owner: <strong style={{ color: 'var(--text-secondary)' }}>{task.ownerName}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!done && (
                      <>
                        <button
                          onClick={() => setDraftModalTask(task)}
                          className="btn btn-secondary btn-xs"
                          title="Generate AI Re-engagement Email"
                        >
                          <Sparkles size={12} color="var(--accent)" />
                          <span>AI Draft</span>
                        </button>
                        <button
                          onClick={() => onCompleteTask(task.id, 'MANUAL_OUTREACH_EXECUTED')}
                          className="btn btn-success btn-xs"
                          disabled={completingTaskId === task.id}
                        >
                          <CheckCircle2 size={12} />
                          <span>{completingTaskId === task.id ? 'Resolving…' : 'Complete & Re-engage'}</span>
                        </button>
                      </>
                    )}
                    {done && (
                      <span className="badge badge-active badge-lg" style={{ padding: '6px 12px' }}>
                        <CheckCircle2 size={12} />
                        Resolved ({task.resolution || 'Done'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Draft Modal */}
      {draftModalTask && (
        <div className="modal-overlay" onClick={() => setDraftModalTask(null)}>
          <div className="modal-panel" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-panel__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={17} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    AI Re-engagement Draft
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    For <strong>{draftModalTask.contactName}</strong> at <strong>{draftModalTask.company}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setDraftModalTask(null)} className="btn btn-ghost btn-xs">
                <X size={16} />
              </button>
            </div>

            <div className="modal-panel__body">
              <div style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {generateDraft(draftModalTask)}
              </div>
            </div>

            <div className="modal-panel__footer">
              <button
                onClick={() => handleCopy(generateDraft(draftModalTask))}
                className="btn btn-primary btn-sm"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Email Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
