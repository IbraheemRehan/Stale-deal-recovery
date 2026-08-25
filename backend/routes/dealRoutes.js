/**
 * Deals REST Routes
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const staleDetector = require('../services/staleDetectorService');

// 1. Get all deals with filters
router.get('/deals', (req, res, next) => {
  try {
    const { stage, isStale, ownerId } = req.query;
    const deals = dataStore.getDeals({ stage, isStale, ownerId });
    return res.json({ success: true, count: deals.length, data: deals });
  } catch (err) {
    next(err);
  }
});

// 2. Get single deal with activities & tasks
router.get('/deals/:id', (req, res, next) => {
  try {
    const deal = dataStore.getDealById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }
    const activities = dataStore.getActivities(deal.id);
    const tasks = dataStore.getTasks({ dealId: deal.id });

    return res.json({
      success: true,
      data: {
        ...deal,
        activities,
        tasks
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Create a new deal
router.post('/deals', (req, res, next) => {
  try {
    const { title, company, contactName, contactEmail, contactPhone, amount, stage, ownerId, notes } = req.body;

    if (!title || !company) {
      return res.status(400).json({ success: false, error: { message: 'Title and Company are required.' } });
    }

    const reps = dataStore.getReps();
    const owner = reps.find(r => r.id === ownerId) || reps[0];

    const newDeal = dataStore.saveDeal({
      title,
      company,
      contactName,
      contactEmail,
      contactPhone,
      amount: parseFloat(amount || 50000),
      stage: stage || 'DISCOVERY',
      ownerId: owner.id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      notes
    });

    return res.status(201).json({
      success: true,
      message: `Deal "${newDeal.title}" created successfully!`,
      data: newDeal
    });
  } catch (err) {
    next(err);
  }
});

// 4. Update a deal
router.put('/deals/:id', (req, res, next) => {
  try {
    const existing = dataStore.getDealById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }

    const updated = dataStore.saveDeal({
      ...existing,
      ...req.body,
      id: req.params.id
    });

    return res.json({
      success: true,
      message: `Deal "${updated.title}" updated.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// 5. Execute Recovery Touchpoint (Unflags STALE, completes auto-task, logs touch)
router.post('/deals/:id/touch', (req, res, next) => {
  try {
    const { activityType, notes, subject } = req.body;
    const deal = dataStore.getDealById(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }

    const updatedDeal = dataStore.touchDeal(req.params.id, {
      type: activityType || 'RE_ENGAGEMENT_CALL',
      subject: subject || 'Recovery Follow-up Completed',
      notes: notes || 'Sales representative re-contacted prospect to re-activate deal.',
      repName: deal.ownerName
    });

    return res.json({
      success: true,
      message: `Deal "${deal.title}" re-activated! Stale flag removed and follow-up task completed.`,
      data: updatedDeal
    });
  } catch (err) {
    next(err);
  }
});

// 6. Escalate deal to manager
router.post('/deals/:id/escalate', (req, res, next) => {
  try {
    const { reason } = req.body;
    const escalated = dataStore.escalateDeal(req.params.id, reason);
    if (!escalated) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }

    return res.json({
      success: true,
      message: `Deal "${escalated.title}" escalated to sales management.`,
      data: escalated
    });
  } catch (err) {
    next(err);
  }
});

// 7. Trigger on-demand stale scan
router.post('/deals/scan-stale', async (req, res, next) => {
  try {
    const result = await staleDetector.scanStaleDeals();
    return res.json({
      success: true,
      message: `Scan complete: ${result.flaggedCount} deals flagged as stale, ${result.tasksCreated} follow-up tasks generated.`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// 8. Delete deal
router.delete('/deals/:id', (req, res, next) => {
  try {
    const deleted = dataStore.deleteDeal(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }
    return res.json({ success: true, message: 'Deal deleted.', data: deleted });
  } catch (err) {
    next(err);
  }
});

// 9. Clear all data
router.post('/deals/clear', (req, res, next) => {
  try {
    dataStore.clearData();
    return res.json({ success: true, message: 'All deals, tasks, and activity logs cleared.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
