import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Mail, 
  Building2, 
  DollarSign, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function AutoTasksDrawer({ tasks = [], onCompleteTask, completingTaskId, addToast }) {
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | COMPLETED
  const [draftModalTask, setDraftModalTask] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'PENDING') return t.status === 'PENDING';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const generateEmailDraft = (task) => {
    return `Subject: Checking in regarding ${task.dealTitle || 'our recent discussion'}

Hi ${task.contactName || 'there'},

I wanted to follow up on our previous scoping discussion regarding ${task.dealTitle}. 

We've recently helped teams similar to ${task.company} streamline their workflows and achieve significant ROI within the first 30 days.

Are you available for a brief 10-minute check-in this Thursday at 2:00 PM EST to address any open questions regarding the proposal?

Best regards,
${task.ownerName}
${task.ownerEmail}`;
  };

  const handleCopyDraft = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (addToast) {
      addToast({
        type: 'success',
        title: 'Draft Copied',
        message: 'AI re-engagement draft copied to clipboard!'
      });
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ent-card" style={{ padding: '20px' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              📋 Auto-Generated Stale Deal Recovery Tasks
            </h2>
            <span className="badge badge-active">
              {tasks.filter(t => t.status === 'PENDING').length} Pending Tasks
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            When any deal exceeds 7 days of inactivity, the recovery engine automatically creates a high-priority follow-up task assigned to the rep.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
          {['ALL', 'PENDING', 'COMPLETED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                border: 'none',
                background: filter === f ? '#ffffff' : 'transparent',
                color: filter === f ? '#0f172a' : '#64748b',
                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
                fontWeight: filter === f ? 700 : 500
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            All Follow-up Tasks Cleared!
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            No matching tasks found for the selected filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                style={{
                  background: isCompleted ? '#f8fafc' : '#ffffff',
                  border: `1px solid ${isCompleted ? '#e2e8f0' : '#cbd5e1'}`,
                  borderLeft: isCompleted ? '4px solid #059669' : task.priority === 'URGENT' ? '4px solid #dc2626' : '4px solid #2563eb',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* Left: Task Info */}
                <div style={{ flex: '1 1 450px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: isCompleted ? '#64748b' : '#0f172a', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </h3>
                    <span className={`badge ${task.priority === 'URGENT' ? 'badge-stale' : 'badge-neutral'}`} style={{ fontSize: '0.66rem' }}>
                      {task.priority}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {task.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} />
                      <span>{task.company} ({formatCurrency(task.dealAmount)})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span>Owner: <strong>{task.ownerName}</strong> ({task.ownerEmail})</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => setDraftModalTask(task)}
                        className="btn btn-secondary btn-sm"
                        title="Generate AI Re-engagement Email Draft"
                      >
                        <Sparkles size={12} color="#2563eb" />
                        <span>AI Email Draft</span>
                      </button>

                      <button
                        onClick={() => onCompleteTask(task.id, 'MANUAL_OUTREACH_EXECUTED')}
                        className="btn btn-success btn-sm"
                        disabled={completingTaskId === task.id}
                      >
                        <CheckCircle2 size={12} />
                        <span>{completingTaskId === task.id ? 'Resolving...' : 'Complete & Re-engage'}</span>
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <span className="badge badge-active" style={{ padding: '6px 10px' }}>
                      <CheckCircle2 size={12} />
                      Resolved ({task.resolution || 'Completed'})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Email Draft Modal */}
      {draftModalTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="ent-card" style={{ maxWidth: '580px', width: '100%', padding: '24px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  AI Re-engagement Email Draft
                </h3>
              </div>
              <button 
                onClick={() => setDraftModalTask(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Tailored outreach draft for <strong>{draftModalTask.contactName}</strong> at <strong>{draftModalTask.company}</strong>:
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#1e293b',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              {generateEmailDraft(draftModalTask)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => handleCopyDraft(generateEmailDraft(draftModalTask))}
                className="btn btn-primary btn-sm"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
