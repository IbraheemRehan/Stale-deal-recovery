import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function RepWorkloadTable({
  reps = [],
  onAddRep,
  onUpdateRep,
  onDeleteRep,
  addToast
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingRep, setEditingRep] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Account Executive', phone: '', active: true
  });

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const openAdd = () => {
    setEditingRep(null);
    setFormData({ name: '', email: '', role: 'Account Executive', phone: '', active: true });
    setShowModal(true);
  };

  const openEdit = (rep) => {
    setEditingRep(rep);
    setFormData({
      name: rep.name,
      email: rep.email,
      role: rep.role || 'Account Executive',
      phone: rep.phone || '',
      active: rep.active !== undefined ? rep.active : true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast?.({ type: 'error', title: 'Validation', message: 'Name and Email are required.' });
      return;
    }
    try {
      if (editingRep) {
        await onUpdateRep(editingRep.id, formData);
        addToast?.({ type: 'success', title: 'Updated', message: `${formData.name} updated.` });
      } else {
        await onAddRep(formData);
        addToast?.({ type: 'success', title: 'Added', message: `${formData.name} added to team.` });
      }
      setShowModal(false);
    } catch (err) {
      addToast?.({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  return (
    <div className="ent-card slide-up" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 0' }}>
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="section-header__title">👥 Sales Team & Recovery Metrics</h2>
              <span className="badge badge-accent badge-lg">{reps.length} Reps</span>
            </div>
            <p className="section-header__subtitle">
              Monitor deal distribution, stale pipeline exposure, and individual rep recovery performance.
            </p>
          </div>
          <button onClick={openAdd} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Add Rep</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)'
        }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Representative</th>
                <th>Role</th>
                <th>Open Deals</th>
                <th>Stale</th>
                <th>At-Risk Value</th>
                <th>Recovery Rate</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reps.map(rep => {
                const rate = rep.recoveryWinRate !== undefined ? rep.recoveryWinRate : 100;
                const rateClass = rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger';

                return (
                  <tr key={rep.id}>
                    {/* Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar--indigo">
                          {rep.avatar || (rep.name || 'SR').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rep.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rep.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '3px' }}>
                        {rep.role || 'AE'}
                      </div>
                      <span className={`badge ${rep.active !== false ? 'badge-active' : 'badge-neutral'}`} style={{ fontSize: '0.66rem' }}>
                        {rep.active !== false ? 'Active' : 'Out of Office'}
                      </span>
                    </td>

                    {/* Open Deals */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {rep.openDealsCount || 0}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '4px' }}>deals</span>
                    </td>

                    {/* Stale */}
                    <td>
                      {(rep.staleDealsCount || 0) > 0 ? (
                        <span className="badge badge-stale" style={{ fontWeight: 800 }}>
                          <AlertTriangle size={10} />
                          {rep.staleDealsCount} Stale
                        </span>
                      ) : (
                        <span className="badge badge-active">0 Stale</span>
                      )}
                    </td>

                    {/* At-Risk */}
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: (rep.atRiskValue || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)',
                        fontSize: '0.88rem'
                      }}>
                        {fmt(rep.atRiskValue || 0)}
                      </span>
                    </td>

                    {/* Recovery Rate */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar">
                          <div
                            className={`progress-bar__fill progress-bar__fill--${rateClass}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rate}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => openEdit(rep)} className="btn btn-ghost btn-xs" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteRep(rep.id)}
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--danger)' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-panel" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-panel__header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingRep ? 'Edit Representative' : 'Add Representative'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-xs">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Elena Rostova"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="rep@company.com"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Title</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                    placeholder="Enterprise Closer"
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="activeCheck"
                    checked={formData.active}
                    onChange={(e) => setFormData(p => ({ ...p, active: e.target.checked }))}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="activeCheck" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Active for deal assignments & follow-up tasks
                  </label>
                </div>
              </div>

              <div className="modal-panel__footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingRep ? 'Save Changes' : 'Create Rep'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
