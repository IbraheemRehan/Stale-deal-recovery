/**
 * Enterprise Stale Deal Detection Engine
 * Scans open pipeline deals for inactivity >= 7 days (or configured threshold),
 * marks them STALE, auto-generates follow-up tasks, and triggers re-engagement workflows.
 */

const dataStore = require('./dataStore');
const config = require('../config/env');
const emailService = require('./emailNotificationService');

class StaleDetectorService {
  constructor() {
    this.intervalId = null;
    this.thresholdDays = config.STALE_THRESHOLD_DAYS || 7;
    this.isScanning = false;
  }

  startBackgroundScanner(intervalMs = 30000) {
    console.log(`[Stale Detector] Starting background stale deal scanner (${this.thresholdDays}-day threshold, scan every ${intervalMs / 1000}s)`);
    this.scanStaleDeals();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.scanStaleDeals();
    }, intervalMs);
  }

  stopBackgroundScanner() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Scan open deals and flag any deal untouched >= thresholdDays
   */
  async scanStaleDeals() {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      const allDeals = dataStore.getDeals();
      const openDeals = allDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
      const now = Date.now();
      const thresholdMs = this.thresholdDays * 24 * 60 * 60 * 1000;

      let flaggedCount = 0;
      let tasksCreated = 0;
      const flaggedDeals = [];

      for (const deal of openDeals) {
        const lastActMs = new Date(deal.lastActivityAt || deal.createdAt).getTime();
        const inactiveMs = now - lastActMs;
        const daysInactive = Math.floor(inactiveMs / (24 * 60 * 60 * 1000));

        if (inactiveMs >= thresholdMs) {
          // This deal is STALE!
          if (!deal.isStale) {
            flaggedCount++;
            dataStore.saveDeal({
              id: deal.id,
              isStale: true,
              staleFlaggedAt: new Date().toISOString()
            });

            dataStore.logEvent('STALE_DEAL_FLAGGED', deal.id, deal.ownerId, {
              title: deal.title,
              amount: deal.amount,
              daysInactive,
              thresholdDays: this.thresholdDays
            });

            // 1. Auto-generate follow-up task if no pending task exists
            const existingTasks = dataStore.getTasks({ dealId: deal.id, status: 'PENDING' });
            if (existingTasks.length === 0) {
              const priority = deal.amount >= 100000 ? 'URGENT' : daysInactive >= 10 ? 'HIGH' : 'MEDIUM';
              const createdTask = dataStore.createTask({
                dealId: deal.id,
                dealTitle: deal.title,
                dealAmount: deal.amount,
                company: deal.company,
                contactName: deal.contactName,
                contactEmail: deal.contactEmail,
                ownerId: deal.ownerId,
                ownerName: deal.ownerName,
                ownerEmail: deal.ownerEmail,
                title: `🚨 Re-engage Stale Deal: ${deal.title} (${daysInactive}d untouched)`,
                description: `Deal has had no activity for ${daysInactive} days in ${deal.stage} stage. Value: $${deal.amount.toLocaleString()}. Execute re-engagement touchpoint immediately.`,
                priority,
                dueDate: new Date(now + 24 * 60 * 60 * 1000).toISOString()
              });
              tasksCreated++;

              // 2. Dispatch email notification to deal owner
              if (deal.ownerEmail) {
                emailService.sendStaleDealAlert(deal, daysInactive, createdTask);
              }
            }

            flaggedDeals.push({
              id: deal.id,
              title: deal.title,
              amount: deal.amount,
              daysInactive
            });
          }
        }
      }

      if (flaggedCount > 0) {
        console.log(`[Stale Detector] Flagged ${flaggedCount} stale deals, generated ${tasksCreated} follow-up tasks.`);
      }

      return {
        scannedOpenDeals: openDeals.length,
        flaggedCount,
        tasksCreated,
        flaggedDeals
      };
    } catch (err) {
      console.error('[Stale Detector] Error scanning deals:', err.message);
      return { error: err.message };
    } finally {
      this.isScanning = false;
    }
  }
}

module.exports = new StaleDetectorService();
