import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KPIHeader from './components/KPIHeader';
import DealsKanban from './components/DealsKanban';
import StaleWatchlistTable from './components/StaleWatchlistTable';
import AutoTasksDrawer from './components/AutoTasksDrawer';
import RepWorkloadTable from './components/RepWorkloadTable';
import DealDetailModal from './components/DealDetailModal';
import Toast from './components/Toast';
import { api } from './services/api';
import { Plus, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reps, setReps] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [touchingId, setTouchingId] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Configurable stale threshold
  const [staleDays, setStaleDays] = useState(7);
  const [staleDaysInput, setStaleDaysInput] = useState(7);

  // New Deal Form
  const [newDealForm, setNewDealForm] = useState({
    title: '', company: '', contactName: '', contactEmail: '',
    contactPhone: '', amount: 75000, stage: 'DISCOVERY', ownerId: '', notes: ''
  });

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Data Loading ───
  const loadData = useCallback(async () => {
    try {
      const [dashRes, dealsRes, tasksRes, repsRes] = await Promise.all([
        api.getDashboard(), api.getDeals(), api.getTasks(), api.getReps()
      ]);
      if (dashRes?.data?.metrics) setMetrics(dashRes.data.metrics);
      if (dealsRes?.data) setDeals(dealsRes.data);
      if (tasksRes?.data) setTasks(tasksRes.data);
      if (repsRes?.data) setReps(repsRes.data);
    } catch (err) {
      console.error('[App] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res?.data?.staleDays) {
          setStaleDays(res.data.staleDays);
          setStaleDaysInput(res.data.staleDays);
        }
      })
      .catch(() => {});
    loadData();
    const iv = setInterval(loadData, 10000);
    return () => clearInterval(iv);
  }, [loadData]);

  // ─── Actions ───
  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await api.triggerStaleScan();
      addToast({ type: 'success', title: 'Scan Complete', message: res.message || 'Pipeline scan finished.' });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Scan Error', message: err.message });
    } finally {
      setScanning(false);
    }
  };

  const handleTouchDeal = async (dealId, payload) => {
    setTouchingId(dealId);
    try {
      const res = await api.touchDeal(dealId, payload);
      addToast({ type: 'success', title: 'Deal Re-activated', message: res.message });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setTouchingId(null);
    }
  };

  const handleEscalateDeal = async (dealId, reason) => {
    try {
      const res = await api.escalateDeal(dealId, reason);
      addToast({ type: 'warning', title: 'Escalated', message: res.message });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Escalation Failed', message: err.message });
    }
  };

  const handleCompleteTask = async (taskId, resolution) => {
    setCompletingTaskId(taskId);
    try {
      const res = await api.completeTask(taskId, resolution);
      addToast({ type: 'success', title: 'Task Resolved', message: res.message });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleCreateDealSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDeal(newDealForm);
      addToast({ type: 'success', title: 'Deal Created', message: `"${newDealForm.title}" added to pipeline.` });
      setShowNewDealModal(false);
      setNewDealForm({
        title: '', company: '', contactName: '', contactEmail: '',
        contactPhone: '', amount: 75000, stage: 'DISCOVERY', ownerId: '', notes: ''
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Reset all deals and auto-generated task logs?')) return;
    try {
      await api.clearAllData();
      addToast({ type: 'info', title: 'Cleared', message: 'Pipeline and task logs reset.' });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Clear Failed', message: err.message });
    }
  };

  // Stale threshold update
  const handleStaleDaysApply = async () => {
    const days = parseInt(staleDaysInput, 10);
    if (!days || days < 1 || days > 90) {
      addToast({ type: 'error', title: 'Invalid', message: 'Threshold must be 1–90 days.' });
      return;
    }
    try {
      const res = await api.updateSettings({ staleDays: days });
      setStaleDays(days);
      addToast({ type: 'success', title: 'Threshold Updated', message: res.message || `Now ${days} days.` });
      await handleRunScan();
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  // Rep CRUD
  const handleAddRep = async (data) => { await api.addRep(data); await loadData(); };
  const handleUpdateRep = async (id, data) => { await api.updateRep(id, data); await loadData(); };
  const handleDeleteRep = async (id) => {
    if (!window.confirm('Delete this representative?')) return;
    await api.deleteRep(id); await loadData();
  };

  const staleDeals = deals.filter(d => d.isStale);
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');

  return (
    <div className="main-wrapper">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staleCount={staleDeals.length}
        pendingTasksCount={pendingTasks.length}
        onRunScan={handleRunScan}
        scanning={scanning}
        onOpenNewDealModal={() => setShowNewDealModal(true)}
        onClearData={handleClearData}
        staleDays={staleDays}
        onStaleDaysChange={setStaleDaysInput}
        onStaleDaysApply={handleStaleDaysApply}
      />

      {/* KPIs */}
      <KPIHeader metrics={metrics} staleDays={staleDays} />

      {/* Tab Views */}
      <main>
        {activeTab === 'kanban' && (
          <DealsKanban
            deals={deals}
            onSelectDeal={setSelectedDeal}
            onTouchDeal={handleTouchDeal}
            touchingId={touchingId}
          />
        )}

        {activeTab === 'watchlist' && (
          <StaleWatchlistTable
            staleDeals={staleDeals}
            onSelectDeal={setSelectedDeal}
            onTouchDeal={handleTouchDeal}
            onEscalateDeal={handleEscalateDeal}
            touchingId={touchingId}
            staleDays={staleDays}
          />
        )}

        {activeTab === 'tasks' && (
          <AutoTasksDrawer
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            completingTaskId={completingTaskId}
            addToast={addToast}
            staleDays={staleDays}
          />
        )}

        {activeTab === 'team' && (
          <RepWorkloadTable
            reps={reps}
            onAddRep={handleAddRep}
            onUpdateRep={handleUpdateRep}
            onDeleteRep={handleDeleteRep}
            addToast={addToast}
          />
        )}
      </main>

      {/* Deal Dossier */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onTouchDeal={handleTouchDeal}
          onEscalateDeal={handleEscalateDeal}
          touchingId={touchingId}
          addToast={addToast}
          staleDays={staleDays}
        />
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="modal-overlay" onClick={() => setShowNewDealModal(false)}>
          <div className="modal-panel" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-panel__header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Create Pipeline Deal
              </h3>
              <button onClick={() => setShowNewDealModal(false)} className="btn btn-ghost btn-xs">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit}>
              <div className="modal-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Deal Title *</label>
                  <input
                    type="text"
                    value={newDealForm.title}
                    onChange={(e) => setNewDealForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Enterprise Cloud Security Platform"
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input
                      type="text"
                      value={newDealForm.company}
                      onChange={(e) => setNewDealForm(p => ({ ...p, company: e.target.value }))}
                      placeholder="Hyperion Defense"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($) *</label>
                    <input
                      type="number"
                      value={newDealForm.amount}
                      onChange={(e) => setNewDealForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="75000"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      value={newDealForm.contactName}
                      onChange={(e) => setNewDealForm(p => ({ ...p, contactName: e.target.value }))}
                      placeholder="Marcus Brody"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      value={newDealForm.contactEmail}
                      onChange={(e) => setNewDealForm(p => ({ ...p, contactEmail: e.target.value }))}
                      placeholder="marcus@company.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Stage</label>
                    <select
                      value={newDealForm.stage}
                      onChange={(e) => setNewDealForm(p => ({ ...p, stage: e.target.value }))}
                      className="input-field select-field"
                    >
                      <option value="DISCOVERY">Discovery</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CONTRACT_REVIEW">Contract Review</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Owner</label>
                    <select
                      value={newDealForm.ownerId}
                      onChange={(e) => setNewDealForm(p => ({ ...p, ownerId: e.target.value }))}
                      className="input-field select-field"
                    >
                      <option value="">Auto-Assign</option>
                      {reps.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={newDealForm.notes}
                    onChange={(e) => setNewDealForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Customer scope details…"
                    rows={2}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-panel__footer">
                <button type="button" onClick={() => setShowNewDealModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={13} />
                  <span>Create Deal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
