/**
 * Unified Stale Deal Recovery Persistence Engine
 * Supports Deals, Auto-Generated Follow-up Tasks, Activity Timelines, Sales Reps, and Audit Logs.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const REPS_FILE = path.join(DATA_DIR, 'salesReps.json');
const EVENTS_FILE = path.join(DATA_DIR, 'auditEvents.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_REPS = [
  {
    id: 'rep_101',
    name: 'Muhammad Ibraheem',
    email: process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
    role: 'Senior Account Executive',
    phone: '+1 (555) 201-9988',
    active: true,
    avatar: 'MI'
  },
  {
    id: 'rep_102',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise-crm.io',
    role: 'Enterprise Deal Closer',
    phone: '+1 (555) 302-8877',
    active: true,
    avatar: 'ER'
  },
  {
    id: 'rep_103',
    name: 'David Kim',
    email: 'david.kim@enterprise-crm.io',
    role: 'Commercial AE',
    phone: '+1 (555) 403-7766',
    active: true,
    avatar: 'DK'
  }
];

class DataStore {
  constructor() {
    this._initStore();
  }

  _initStore() {
    if (!fs.existsSync(REPS_FILE)) {
      fs.writeFileSync(REPS_FILE, JSON.stringify(DEFAULT_REPS, null, 2), 'utf8');
    }
    if (!fs.existsSync(DEALS_FILE)) {
      this._seedInitialDeals();
    }
    if (!fs.existsSync(TASKS_FILE)) {
      fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(ACTIVITIES_FILE)) {
      fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(EVENTS_FILE)) {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  }

  _seedInitialDeals() {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const initialDeals = [
      {
        id: 'deal_101',
        title: 'Enterprise CRM Migration & AI Add-on',
        company: 'Apex Global Logistics',
        contactName: 'Marcus Brody',
        contactEmail: 'marcus.brody@apexlogistics.com',
        contactPhone: '+1 (555) 321-7788',
        amount: 85000,
        stage: 'PROPOSAL', // DISCOVERY | PROPOSAL | NEGOTIATION | CONTRACT_REVIEW | CLOSED_WON | CLOSED_LOST
        ownerId: 'rep_101',
        ownerName: 'Muhammad Ibraheem',
        ownerEmail: process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
        createdAt: new Date(now - 14 * DAY).toISOString(),
        lastActivityAt: new Date(now - 9 * DAY).toISOString(), // 9 days inactive -> STALE!
        isStale: true,
        staleFlaggedAt: new Date(now - 2 * DAY).toISOString(),
        escalated: false,
        followUpCount: 0,
        notes: 'Sent formal proposal for 85 enterprise seats. Client requested procurement review.'
      },
      {
        id: 'deal_102',
        title: 'Bio-Informatics Data Pipeline Platform',
        company: 'Quantum BioLabs',
        contactName: 'Dr. Evelyn Sterling',
        contactEmail: 'evelyn.sterling@quantumbiolabs.com',
        contactPhone: '+1 (555) 789-2211',
        amount: 140000,
        stage: 'NEGOTIATION',
        ownerId: 'rep_101',
        ownerName: 'Muhammad Ibraheem',
        ownerEmail: process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
        createdAt: new Date(now - 21 * DAY).toISOString(),
        lastActivityAt: new Date(now - 11 * DAY).toISOString(), // 11 days inactive -> STALE!
        isStale: true,
        staleFlaggedAt: new Date(now - 4 * DAY).toISOString(),
        escalated: true,
        followUpCount: 1,
        notes: 'Executive budget approved, but legal redlines have stalled for 11 days.'
      },
      {
        id: 'deal_103',
        title: 'Cloud Infrastructure Observability Rollout',
        company: 'Vanguard FinTech',
        contactName: 'Sarah Jenkins',
        contactEmail: 's.jenkins@vanguardfintech.io',
        contactPhone: '+1 (555) 880-9900',
        amount: 62000,
        stage: 'DISCOVERY',
        ownerId: 'rep_102',
        ownerName: 'Elena Rostova',
        ownerEmail: 'elena.rostova@enterprise-crm.io',
        createdAt: new Date(now - 4 * DAY).toISOString(),
        lastActivityAt: new Date(now - 2 * DAY).toISOString(), // 2 days -> ACTIVE / HEALTHY
        isStale: false,
        staleFlaggedAt: null,
        escalated: false,
        followUpCount: 0,
        notes: 'Initial technical scoping call completed. Follow-up demo scheduled for next Tuesday.'
      },
      {
        id: 'deal_104',
        title: 'Security Operations & SIEM Modernization',
        company: 'Hyperion Defense Corp',
        contactName: 'Col. Arthur Vance',
        contactEmail: 'vance@hyperiondefense.com',
        contactPhone: '+1 (555) 605-4433',
        amount: 210000,
        stage: 'CONTRACT_REVIEW',
        ownerId: 'rep_103',
        ownerName: 'David Kim',
        ownerEmail: 'david.kim@enterprise-crm.io',
        createdAt: new Date(now - 30 * DAY).toISOString(),
        lastActivityAt: new Date(now - 8 * DAY).toISOString(), // 8 days -> STALE!
        isStale: true,
        staleFlaggedAt: new Date(now - 1 * DAY).toISOString(),
        escalated: false,
        followUpCount: 0,
        notes: 'Final MSA in legal compliance review.'
      }
    ];

    fs.writeFileSync(DEALS_FILE, JSON.stringify(initialDeals, null, 2), 'utf8');

    // Auto-create initial follow-up tasks for stale deals
    const initialTasks = [
      {
        id: 'task_auto_101',
        dealId: 'deal_101',
        dealTitle: 'Enterprise CRM Migration & AI Add-on',
        dealAmount: 85000,
        company: 'Apex Global Logistics',
        contactName: 'Marcus Brody',
        contactEmail: 'marcus.brody@apexlogistics.com',
        ownerId: 'rep_101',
        ownerName: 'Muhammad Ibraheem',
        ownerEmail: process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
        title: '🚨 Re-engage Untouched Deal (9 Days Inactive)',
        description: 'Deal has been sitting untouched for 9 days in PROPOSAL stage. Reach out with executive ROI comparison or pricing check-in.',
        priority: 'HIGH',
        status: 'PENDING', // PENDING | COMPLETED | DISMISSED
        dueDate: new Date(now + 1 * DAY).toISOString(),
        createdAt: new Date(now - 2 * DAY).toISOString(),
        completedAt: null
      },
      {
        id: 'task_auto_102',
        dealId: 'deal_102',
        dealTitle: 'Bio-Informatics Data Pipeline Platform',
        dealAmount: 140000,
        company: 'Quantum BioLabs',
        contactName: 'Dr. Evelyn Sterling',
        contactEmail: 'evelyn.sterling@quantumbiolabs.com',
        ownerId: 'rep_101',
        ownerName: 'Muhammad Ibraheem',
        ownerEmail: process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
        title: '🚨 Manager Escalation: High-Value Deal Stalled (11 Days)',
        description: 'Untouched for 11 days in NEGOTIATION. Escalate to VP of Sales and schedule direct executive touchpoint.',
        priority: 'URGENT',
        status: 'PENDING',
        dueDate: new Date(now).toISOString(),
        createdAt: new Date(now - 4 * DAY).toISOString(),
        completedAt: null
      }
    ];

    fs.writeFileSync(TASKS_FILE, JSON.stringify(initialTasks, null, 2), 'utf8');
  }

  // =========================================================================
  // DEALS
  // =========================================================================

  getDeals(filters = {}) {
    try {
      const data = fs.readFileSync(DEALS_FILE, 'utf8');
      let deals = JSON.parse(data || '[]');

      if (filters.stage) {
        deals = deals.filter(d => d.stage === filters.stage);
      }
      if (filters.isStale !== undefined) {
        deals = deals.filter(d => d.isStale === (filters.isStale === 'true' || filters.isStale === true));
      }
      if (filters.ownerId) {
        deals = deals.filter(d => d.ownerId === filters.ownerId);
      }

      // Compute dynamic daysInactive
      const now = Date.now();
      return deals.map(d => {
        const lastAct = new Date(d.lastActivityAt || d.createdAt).getTime();
        const daysInactive = Math.max(0, Math.floor((now - lastAct) / (24 * 60 * 60 * 1000)));
        return {
          ...d,
          daysInactive
        };
      });
    } catch (err) {
      console.error('[DataStore] Error reading deals.json:', err.message);
      return [];
    }
  }

  getDealById(id) {
    const deals = this.getDeals();
    return deals.find(d => d.id === id) || null;
  }

  saveDeal(dealData) {
    let deals = this.getDeals();
    const existingIndex = deals.findIndex(d => d.id === dealData.id);
    const now = new Date().toISOString();

    let saved;

    if (existingIndex >= 0) {
      saved = {
        ...deals[existingIndex],
        ...dealData,
        updatedAt: now
      };
      deals[existingIndex] = saved;
    } else {
      saved = {
        id: dealData.id || `deal_${Date.now().toString().slice(-6)}`,
        title: dealData.title || 'Untitled Deal',
        company: dealData.company || 'Enterprise Prospect',
        contactName: dealData.contactName || 'Primary Contact',
        contactEmail: dealData.contactEmail || 'prospect@company.com',
        contactPhone: dealData.contactPhone || '',
        amount: parseFloat(dealData.amount || 50000),
        stage: dealData.stage || 'DISCOVERY',
        ownerId: dealData.ownerId || 'rep_101',
        ownerName: dealData.ownerName || 'Muhammad Ibraheem',
        ownerEmail: dealData.ownerEmail || process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
        createdAt: dealData.createdAt || now,
        lastActivityAt: dealData.lastActivityAt || now,
        isStale: false,
        staleFlaggedAt: null,
        escalated: false,
        followUpCount: 0,
        notes: dealData.notes || '',
        updatedAt: now
      };
      deals.unshift(saved);
      this.logEvent('DEAL_CREATED', saved.id, saved.ownerId, { title: saved.title, amount: saved.amount });
    }

    try {
      fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2), 'utf8');
    } catch (err) {
      console.error('[DataStore] Error saving deals.json:', err.message);
    }

    return saved;
  }

  touchDeal(dealId, activityData = {}) {
    const deal = this.getDealById(dealId);
    if (!deal) return null;

    const now = new Date().toISOString();
    const updated = this.saveDeal({
      id: deal.id,
      lastActivityAt: now,
      isStale: false,
      staleFlaggedAt: null,
      escalated: false,
      followUpCount: (deal.followUpCount || 0) + 1
    });

    // Auto-complete any pending tasks for this deal
    this.completeTasksForDeal(dealId, activityData.type || 'RE_ENGAGEMENT_TOUCH');

    // Log Activity
    this.logActivity({
      dealId: deal.id,
      type: activityData.type || 'RE_ENGAGEMENT_EMAIL',
      subject: activityData.subject || 'Sales Rep Re-engagement Follow-up',
      notes: activityData.notes || 'Sales rep contacted customer to re-activate deal.',
      repName: activityData.repName || deal.ownerName,
      timestamp: now
    });

    this.logEvent('DEAL_RECOVERED', deal.id, deal.ownerId, {
      title: deal.title,
      amount: deal.amount,
      recoveryAction: activityData.type || 'RE_ENGAGEMENT_TOUCH'
    });

    return updated;
  }

  escalateDeal(dealId, reason = 'Stale for over 10 days with no sales response') {
    const deal = this.getDealById(dealId);
    if (!deal) return null;

    const updated = this.saveDeal({
      id: deal.id,
      escalated: true,
      escalatedAt: new Date().toISOString()
    });

    this.logEvent('DEAL_ESCALATED', deal.id, deal.ownerId, {
      title: deal.title,
      amount: deal.amount,
      reason
    });

    return updated;
  }

  deleteDeal(id) {
    let deals = this.getDeals();
    const target = deals.find(d => d.id === id);
    if (!target) return null;

    deals = deals.filter(d => d.id !== id);
    fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2), 'utf8');
    return target;
  }

  // =========================================================================
  // AUTO-GENERATED TASKS
  // =========================================================================

  getTasks(filters = {}) {
    try {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      let tasks = JSON.parse(data || '[]');

      if (filters.status) {
        tasks = tasks.filter(t => t.status === filters.status);
      }
      if (filters.dealId) {
        tasks = tasks.filter(t => t.dealId === filters.dealId);
      }
      if (filters.ownerId) {
        tasks = tasks.filter(t => t.ownerId === filters.ownerId);
      }

      return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error('[DataStore] Error reading tasks.json:', err.message);
      return [];
    }
  }

  createTask(taskData) {
    const tasks = this.getTasks();
    const newTask = {
      id: taskData.id || `task_${Date.now().toString().slice(-6)}`,
      dealId: taskData.dealId,
      dealTitle: taskData.dealTitle || 'Deal Follow-up',
      dealAmount: taskData.dealAmount || 0,
      company: taskData.company || 'Enterprise Corp',
      contactName: taskData.contactName || 'Primary Contact',
      contactEmail: taskData.contactEmail || '',
      ownerId: taskData.ownerId || 'rep_101',
      ownerName: taskData.ownerName || 'Muhammad Ibraheem',
      ownerEmail: taskData.ownerEmail || process.env.GMAIL_USER || 'ibrahimrhan285@gmail.com',
      title: taskData.title || 'Follow-up on Stale Deal',
      description: taskData.description || 'Deal has exceeded inactivity threshold.',
      priority: taskData.priority || 'HIGH',
      status: 'PENDING',
      dueDate: taskData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    tasks.unshift(newTask);
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');

    this.logEvent('TASK_AUTO_GENERATED', newTask.dealId, newTask.ownerId, {
      taskId: newTask.id,
      title: newTask.title,
      priority: newTask.priority
    });

    return newTask;
  }

  completeTask(taskId, resolution = 'FOLLOWED_UP') {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    tasks[index].status = 'COMPLETED';
    tasks[index].completedAt = new Date().toISOString();
    tasks[index].resolution = resolution;

    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    return tasks[index];
  }

  completeTasksForDeal(dealId, resolution = 'DEAL_TOUCHED') {
    const tasks = this.getTasks();
    let updated = false;

    tasks.forEach(t => {
      if (t.dealId === dealId && t.status === 'PENDING') {
        t.status = 'COMPLETED';
        t.completedAt = new Date().toISOString();
        t.resolution = resolution;
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    }
  }

  // =========================================================================
  // ACTIVITIES & EVENTS
  // =========================================================================

  getActivities(dealId = null) {
    try {
      const data = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
      let acts = JSON.parse(data || '[]');
      if (dealId) {
        acts = acts.filter(a => a.dealId === dealId);
      }
      return acts.slice(0, 100);
    } catch (err) {
      return [];
    }
  }

  logActivity(activityData) {
    const acts = this.getActivities();
    const newAct = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      ...activityData,
      timestamp: activityData.timestamp || new Date().toISOString()
    };
    acts.unshift(newAct);
    if (acts.length > 150) acts.pop();
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(acts, null, 2), 'utf8');
    return newAct;
  }

  getEvents(limit = 50) {
    try {
      const data = fs.readFileSync(EVENTS_FILE, 'utf8');
      const evts = JSON.parse(data || '[]');
      return evts.slice(0, limit);
    } catch (err) {
      return [];
    }
  }

  logEvent(eventType, dealId, repId, details = {}) {
    const evts = this.getEvents(200);
    const newEvt = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      dealId,
      repId,
      details,
      timestamp: new Date().toISOString()
    };
    evts.unshift(newEvt);
    if (evts.length > 200) evts.pop();
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(evts, null, 2), 'utf8');
    return newEvt;
  }

  // =========================================================================
  // REPS CRUD
  // =========================================================================

  getReps() {
    try {
      const data = fs.readFileSync(REPS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return DEFAULT_REPS;
    }
  }

  getRepById(id) {
    const reps = this.getReps();
    return reps.find(r => r.id === id) || null;
  }

  addRep(repData) {
    const reps = this.getReps();
    const newRep = {
      id: repData.id || `rep_${Date.now().toString().slice(-4)}`,
      name: repData.name || 'Sales Rep',
      email: repData.email || 'rep@company.com',
      role: repData.role || 'Account Executive',
      phone: repData.phone || '',
      active: repData.active !== undefined ? repData.active : true,
      avatar: (repData.name || 'SR').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };
    reps.push(newRep);
    fs.writeFileSync(REPS_FILE, JSON.stringify(reps, null, 2), 'utf8');
    return newRep;
  }

  updateRep(id, updateData) {
    const reps = this.getReps();
    const idx = reps.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reps[idx] = { ...reps[idx], ...updateData };
    fs.writeFileSync(REPS_FILE, JSON.stringify(reps, null, 2), 'utf8');
    return reps[idx];
  }

  deleteRep(id) {
    let reps = this.getReps();
    const target = reps.find(r => r.id === id);
    if (!target) return null;
    reps = reps.filter(r => r.id !== id);
    fs.writeFileSync(REPS_FILE, JSON.stringify(reps, null, 2), 'utf8');
    return target;
  }

  clearData() {
    fs.writeFileSync(DEALS_FILE, JSON.stringify([], null, 2), 'utf8');
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify([], null, 2), 'utf8');
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2), 'utf8');
    return true;
  }
}

module.exports = new DataStore();
