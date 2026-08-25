/**
 * Stale Deal Analytics Service
 * Computes pipeline health, at-risk pipeline value, recovery velocity, and rep compliance.
 */

const dataStore = require('./dataStore');

class AnalyticsService {
  getSummaryMetrics() {
    const deals = dataStore.getDeals();
    const tasks = dataStore.getTasks();
    const reps = dataStore.getReps();

    const openDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
    const staleDeals = openDeals.filter(d => d.isStale);
    const healthyDeals = openDeals.filter(d => !d.isStale);

    // Financial Metrics
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const atRiskPipelineValue = staleDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const healthyPipelineValue = totalPipelineValue - atRiskPipelineValue;

    // Stale Rate %
    const staleRatePct = openDeals.length > 0
      ? Math.round((staleDeals.length / openDeals.length) * 100)
      : 0;

    // Inactivity Average
    const avgInactiveDays = openDeals.length > 0
      ? Math.round(openDeals.reduce((sum, d) => sum + (d.daysInactive || 0), 0) / openDeals.length)
      : 0;

    // Tasks metrics
    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const taskResolutionRate = (pendingTasks.length + completedTasks.length) > 0
      ? Math.round((completedTasks.length / (pendingTasks.length + completedTasks.length)) * 100)
      : 100;

    // Reps breakdown
    const repStats = reps.map(r => {
      const repDeals = openDeals.filter(d => d.ownerId === r.id);
      const repStale = repDeals.filter(d => d.isStale);
      const repAtRisk = repStale.reduce((sum, d) => sum + (d.amount || 0), 0);
      const repTasks = tasks.filter(t => t.ownerId === r.id);
      const repCompleted = repTasks.filter(t => t.status === 'COMPLETED');

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        avatar: r.avatar,
        openDealsCount: repDeals.length,
        staleDealsCount: repStale.length,
        atRiskValue: repAtRisk,
        tasksPendingCount: repTasks.filter(t => t.status === 'PENDING').length,
        recoveryWinRate: repTasks.length > 0 ? Math.round((repCompleted.length / repTasks.length) * 100) : 100
      };
    });

    return {
      totalPipelineValue,
      atRiskPipelineValue,
      healthyPipelineValue,
      openDealsCount: openDeals.length,
      staleDealsCount: staleDeals.length,
      healthyDealsCount: healthyDeals.length,
      staleRatePct,
      avgInactiveDays,
      pendingTasksCount: pendingTasks.length,
      completedTasksCount: completedTasks.length,
      taskResolutionRate,
      reps: repStats
    };
  }
}

module.exports = new AnalyticsService();
