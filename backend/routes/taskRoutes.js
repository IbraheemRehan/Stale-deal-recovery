/**
 * Auto-Generated Tasks REST Routes
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// 1. Get all tasks
router.get('/tasks', (req, res, next) => {
  try {
    const { status, dealId, ownerId } = req.query;
    const tasks = dataStore.getTasks({ status, dealId, ownerId });
    return res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
});

// 2. Create task manually
router.post('/tasks', (req, res, next) => {
  try {
    const { dealId, title, description, priority, dueDate, ownerId } = req.body;
    const deal = dealId ? dataStore.getDealById(dealId) : null;
    const reps = dataStore.getReps();
    const owner = reps.find(r => r.id === ownerId) || (deal ? reps.find(r => r.id === deal.ownerId) : reps[0]);

    const task = dataStore.createTask({
      dealId: deal?.id || null,
      dealTitle: deal?.title || 'General Task',
      dealAmount: deal?.amount || 0,
      company: deal?.company || 'Enterprise',
      contactName: deal?.contactName || '',
      contactEmail: deal?.contactEmail || '',
      ownerId: owner.id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      title: title || 'Follow-up Task',
      description,
      priority: priority || 'MEDIUM',
      dueDate
    });

    return res.status(201).json({ success: true, message: 'Task created.', data: task });
  } catch (err) {
    next(err);
  }
});

// 3. Mark task completed
router.patch('/tasks/:id/complete', (req, res, next) => {
  try {
    const { resolution } = req.body;
    const completed = dataStore.completeTask(req.params.id, resolution || 'MANUALLY_COMPLETED');
    if (!completed) {
      return res.status(404).json({ success: false, error: { message: 'Task not found.' } });
    }

    // If linked to a deal, touch the deal to refresh activity timestamp
    if (completed.dealId) {
      dataStore.touchDeal(completed.dealId, {
        type: 'TASK_COMPLETION',
        subject: `Task Completed: ${completed.title}`,
        notes: `Follow-up task resolved with: ${resolution || 'MANUALLY_COMPLETED'}`
      });
    }

    return res.json({
      success: true,
      message: `Task "${completed.title}" marked as completed.`,
      data: completed
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
