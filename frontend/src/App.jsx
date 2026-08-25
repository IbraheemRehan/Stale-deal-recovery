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
import { Plus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // kanban | watchlist | tasks | team
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

  // New Deal Form State
  const [newDealForm, setNewDealForm] = useState({
    title: '',
    company: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    amount: 75000,
    stage: 'DISCOVERY',
    ownerId: '',
    notes: ''
  });

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all state
  const loadData = useCallback(async () => {
    try {
      const [dashRes, dealsRes, tasksRes, repsRes] = await Promise.all([
        api.getDashboard(),
        api.getDeals(),
        api.getTasks(),
        api.getReps()
      ]);

      if (dashRes?.data?.metrics) setMetrics(dashRes.data.metrics);
      if (dealsRes?.data) setDeals(dealsRes.data);
      if (tasksRes?.data) setTasks(tasksRes.data);
      if (repsRes?.data) setReps(repsRes.data);
    } catch (err) {
      console.error('[App] Failed to load data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll every 10 seconds for real-time status updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Run Stale Deal Scan
  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await api.triggerStaleScan();
      addToast({
        type: 'success',
        title: '7-Day Stale Scan Complete',
        message: res.message || 'Pipeline scan finished.'
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Scan Error', message: err.message });
    } finally {
      setScanning(false);
    }
  };

  // Re-engage / Touch Deal
  const handleTouchDeal = async (dealId, payload) => {
    setTouchingId(dealId);
    try {
      const res = await api.touchDeal(dealId, payload);
      addToast({
        type: 'success',
        title: 'Deal Re-activated',
        message: res.message || 'Touchpoint logged and stale flag removed.'
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setTouchingId(null);
    }
  };

  // Escalate Deal
  const handleEscalateDeal = async (dealId, reason) => {
    try {
      const res = await api.escalateDeal(dealId, reason);
      addToast({
        type: 'warning',
        title: 'Manager Escalated',
        message: res.message || 'Deal escalated to sales management.'
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Escalation Failed', message: err.message });
    }
  };

  // Complete Auto-Task
  const handleCompleteTask = async (taskId, resolution) => {
    setCompletingTaskId(taskId);
    try {
      const res = await api.completeTask(taskId, resolution);
      addToast({
        type: 'success',
        title: 'Task Completed',
        message: res.message || 'Auto-generated task resolved.'
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Create Deal
  const handleCreateDealSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createDeal(newDealForm);
      addToast({
        type: 'success',
        title: 'Deal Ingested',
        message: `Deal "${newDealForm.title}" added to pipeline.`
      });
      setShowNewDealModal(false);
      setNewDealForm({
        title: '',
        company: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        amount: 75000,
        stage: 'DISCOVERY',
        ownerId: '',
        notes: ''
      });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    }
  };

  // Clear Pipeline Data
  const handleClearData = async () => {
    if (!window.confirm('Reset all deals and auto-generated task logs?')) return;
    try {
      await api.clearAllData();
      addToast({ type: 'info', title: 'Pipeline Cleared', message: 'Dataset reset.' });
      await loadData();
    } catch (err) {
      addToast({ type: 'error', title: 'Clear Failed', message: err.message });
    }
  };

  // Sales Rep CRUD Handlers
  const handleAddRep = async (repData) => {
    await api.addRep(repData);
    await loadData();
  };

  const handleUpdateRep = async (id, repData) => {
    await api.updateRep(id, repData);
    await loadData();
  };

  const handleDeleteRep = async (id) => {
    if (!window.confirm('Are you sure you want to delete this representative?')) return;
    await api.deleteRep(id);
    await loadData();
  };

  const staleDeals = deals.filter(d => d.isStale);
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');

  return (
    <div className="main-wrapper">
      {/* 1. Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staleCount={staleDeals.length}
        pendingTasksCount={pendingTasks.length}
        onRunScan={handleRunScan}
        scanning={scanning}
        onOpenNewDealModal={() => setShowNewDealModal(true)}
        onClearData={handleClearData}
      />

      {/* 2. Key Performance Indicators */}
      <KPIHeader metrics={metrics} />

      {/* 3. Tab Views */}
      <main>
        {activeTab === 'kanban' && (
          <DealsKanban
            deals={deals}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onTouchDeal={handleTouchDeal}
            touchingId={touchingId}
          />
        )}

        {activeTab === 'watchlist' && (
          <StaleWatchlistTable
            staleDeals={staleDeals}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onTouchDeal={handleTouchDeal}
            onEscalateDeal={handleEscalateDeal}
            touchingId={touchingId}
          />
        )}

        {activeTab === 'tasks' && (
          <AutoTasksDrawer
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            completingTaskId={completingTaskId}
            addToast={addToast}
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

      {/* Deal Dossier Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onTouchDeal={handleTouchDeal}
          onEscalateDeal={handleEscalateDeal}
          touchingId={touchingId}
          addToast={addToast}
        />
      )}

      {/* New Deal Intake Modal */}
      {showNewDealModal && (
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
          <div className="ent-card" style={{ maxWidth: '520px', width: '100%', padding: '24px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Create New Pipeline Deal
            </h3>

            <form onSubmit={handleCreateDealSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={newDealForm.title}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Enterprise Cloud Security Platform"
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newDealForm.company}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Hyperion Defense"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Deal Amount ($) *
                  </label>
                  <input
                    type="number"
                    value={newDealForm.amount}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="75000"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newDealForm.contactName}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Marcus Brody"
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newDealForm.contactEmail}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="marcus@company.com"
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Initial Stage
                  </label>
                  <select
                    value={newDealForm.stage}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, stage: e.target.value }))}
                    className="input-field select-field"
                  >
                    <option value="DISCOVERY">Discovery</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CONTRACT_REVIEW">Contract Review</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Assigned Owner
                  </label>
                  <select
                    value={newDealForm.ownerId}
                    onChange={(e) => setNewDealForm(prev => ({ ...prev, ownerId: e.target.value }))}
                    className="input-field select-field"
                  >
                    <option value="">Auto-Assign Owner</option>
                    {reps.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Deal Context / Scoping Notes
                </label>
                <textarea
                  value={newDealForm.notes}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Details regarding customer scope..."
                  rows={2}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowNewDealModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={12} />
                  <span>Create Deal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
