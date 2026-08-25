/**
 * Analytics Dashboard REST Routes
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const dataStore = require('../services/dataStore');

router.get('/analytics/dashboard', (req, res, next) => {
  try {
    const metrics = analyticsService.getSummaryMetrics();
    const recentEvents = dataStore.getEvents(15);
    const recentActivities = dataStore.getActivities().slice(0, 15);

    return res.json({
      success: true,
      data: {
        metrics,
        recentEvents,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
