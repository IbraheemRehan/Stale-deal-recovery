/**
 * Inbound Webhooks for n8n & Automated Job Schedulers
 */

const express = require('express');
const router = express.Router();
const staleDetector = require('../services/staleDetectorService');
const dataStore = require('../services/dataStore');

// 1. Hourly Stale Deal Scan Webhook (Called by n8n or Redis Cron Job)
router.post('/webhooks/stale-scan', async (req, res, next) => {
  try {
    const scanResult = await staleDetector.scanStaleDeals();
    return res.json({
      success: true,
      message: `Automated hourly stale deal scan executed: ${scanResult.flaggedCount} deals flagged, ${scanResult.tasksCreated} tasks created.`,
      data: scanResult
    });
  } catch (err) {
    next(err);
  }
});

// 2. n8n Stale Deal Action Webhook (e.g. n8n triggers Slack alert or logs AI recovery email)
router.post('/webhooks/n8n-stale-alert', (req, res, next) => {
  try {
    const { dealId, action, notes, repName } = req.body;
    const deal = dataStore.getDealById(dealId);

    if (!deal) {
      return res.status(404).json({ success: false, error: { message: 'Deal not found.' } });
    }

    const activity = dataStore.logActivity({
      dealId: deal.id,
      type: action || 'N8N_AUTOMATION_ALERT',
      subject: `n8n AI Recovery Workflow: ${action || 'Alert Dispatched'}`,
      notes: notes || 'Automated outreach dispatched to Slack & Gmail.',
      repName: repName || 'n8n Workflow Engine'
    });

    return res.json({
      success: true,
      message: `n8n automation logged for deal "${deal.title}".`,
      data: { deal, activity }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
