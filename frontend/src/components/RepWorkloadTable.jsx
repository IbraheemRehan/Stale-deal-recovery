import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Mail, 
  Phone,
  ShieldCheck
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
    name: '',
    email: '',
    role: 'Account Executive',
    phone: '',
    active: true
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleOpenAdd = () => {
    setEditingRep(null);
    setFormData({
      name: '',
      email: '',
      role: 'Account Executive',
      phone: '',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rep) => {
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
      if (addToast) addToast({ type: 'error', title: 'Validation Error', message: 'Name and Email are required.' });
      return;
    }

    try {
      if (editingRep) {
        await onUpdateRep(editingRep.id, formData);
        if (addToast) addToast({ type: 'success', title: 'Rep Updated', message: `${formData.name} updated successfully.` });
      } else {
        await onAddRep(formData);
        if (addToast) addToast({ type: 'success', title: 'Rep Added', message: `${formData.name} added to sales team.` });
      }
      setShowModal(false);
    } catch (err) {
      if (addToast) addToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  return (
    <div className="ent-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              👥 Sales Team Workload &amp; Stale Recovery Rate
            </h2>
            <span className="badge badge-active">
              {reps.length} Reps On Roster
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Monitor deal distribution, untouched pipelines, and individual rep recovery turnaround metrics.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={12} />
          <span>Add Sales Rep</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <th style={{ padding: '10px 12px' }}>Representative</th>
              <th style={{ padding: '10px 12px' }}>Role / Status</th>
              <th style={{ padding: '10px 12px' }}>Open Deals</th>
              <th style={{ padding: '10px 12px' }}>Stale Pipeline</th>
              <th style={{ padding: '10px 12px' }}>At-Risk Value</th>
              <th style={{ padding: '10px 12px' }}>Recovery Rate</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reps.map(rep => (
              <tr 
                key={rep.id} 
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Rep Name & Email */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #bfdbfe'
                    }}>
                      {rep.avatar || (rep.name || 'SR').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{rep.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rep.email}</div>
                    </div>
                  </div>
                </td>

                {/* Role / Status */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.76rem' }}>{rep.role || 'AE'}</div>
                  <span className={`badge ${rep.active !== false ? 'badge-active' : 'badge-neutral'}`} style={{ fontSize: '0.64rem', marginTop: '2px' }}>
                    {rep.active !== false ? 'Active' : 'Out of Office'}
                  </span>
                </td>

                {/* Open Deals */}
                <td style={{ padding: '12px', fontWeight: 600 }}>
                  {rep.openDealsCount || 0} Deals
                </td>

                {/* Stale Deals */}
                <td style={{ padding: '12px' }}>
                  {(rep.staleDealsCount || 0) > 0 ? (
                    <span className="badge badge-stale" style={{ fontWeight: 800 }}>
                      <AlertTriangle size={10} />
                      {rep.staleDealsCount} Stale
                    </span>
                  ) : (
                    <span className="badge badge-active">
                      0 Stale
                    </span>
                  )}
                </td>

                {/* At-Risk Value */}
                <td style={{ padding: '12px', fontWeight: 700, color: (rep.atRiskValue || 0) > 0 ? 'var(--status-stale)' : 'var(--text-muted)' }}>
                  {formatCurrency(rep.atRiskValue || 0)}
                </td>

                {/* Recovery Rate */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${rep.recoveryWinRate !== undefined ? rep.recoveryWinRate : 100}%`,
                        height: '100%',
                        background: (rep.recoveryWinRate || 100) >= 80 ? '#059669' : '#d97706'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                      {rep.recoveryWinRate !== undefined ? rep.recoveryWinRate : 100}%
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button 
                      onClick={() => handleOpenEdit(rep)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      title="Edit Representative"
                    >
                      <Edit3 size={12} />
                    </button>

                    <button 
                      onClick={() => onDeleteRep(rep.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', color: '#dc2626' }}
                      title="Delete Representative"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Rep Modal */}
      {showModal && (
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
          <div className="ent-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              {editingRep ? 'Edit Sales Representative' : 'Add Sales Representative'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Elena Rostova"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Work Email (Receives Stale Alerts) *
                </label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="rep@company.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Role Title
                </label>
                <input 
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Enterprise Closer"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '0.76rem', color: '#0f172a', cursor: 'pointer' }}>
                  Active for Deal Assignments &amp; Follow-up Tasks
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
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
