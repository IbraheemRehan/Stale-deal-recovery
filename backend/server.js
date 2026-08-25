/**
 * Enterprise Stale Deal Recovery API Gateway & Background Engine
 * Architecture: Node.js + Express + BullMQ/Timer Queue + PostgreSQL/JSON Store + n8n Webhooks
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');

const dealRoutes = require('./routes/dealRoutes');
const taskRoutes = require('./routes/taskRoutes');
const repRoutes = require('./routes/repRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const staleDetector = require('./services/staleDetectorService');

const app = express();

// 1. Security & Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:5175', 'http://127.0.0.1:5175',
    'http://localhost:5176', 'http://127.0.0.1:5176',
    'http://localhost:5177', 'http://127.0.0.1:5177',
    'http://localhost:3000', 'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
}

// 2. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Stale Deal Recovery & Auto-Task Engine',
    timestamp: new Date().toISOString(),
    staleThresholdDays: config.STALE_THRESHOLD_DAYS,
    port: config.PORT
  });
});

// 3. Mount Routes
app.use('/api', dealRoutes);
app.use('/api', taskRoutes);
app.use('/api', repRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', webhookRoutes);

// 4. 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
      code: 'ROUTE_NOT_FOUND',
      status: 404
    }
  });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Stale Recovery API Error]', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
});

// 6. Start Server & Background Stale Scanner
const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`
============================================================
 🛡️ Enterprise Stale Deal Recovery Engine Live!
============================================================
 🚀 Server Port:            http://localhost:${config.PORT}
 📊 Analytics Dashboard:    http://localhost:${config.PORT}/api/analytics/dashboard
 💼 Open & Stale Deals:     http://localhost:${config.PORT}/api/deals
 📋 Auto-Generated Tasks:   http://localhost:${config.PORT}/api/tasks
 📥 Scheduled Scan Hook:    http://localhost:${config.PORT}/api/webhooks/stale-scan
 ⏳ Stale Threshold Limit:  ${config.STALE_THRESHOLD_DAYS} Days Inactivity
============================================================
  `);

  // Start background periodic stale deal scanner (runs every 30 seconds)
  staleDetector.startBackgroundScanner(30000);
});

module.exports = { app, server };
