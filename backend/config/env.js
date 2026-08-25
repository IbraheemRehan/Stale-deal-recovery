require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5070,
  NODE_ENV: process.env.NODE_ENV || 'development',
  STALE_THRESHOLD_DAYS: parseInt(process.env.STALE_THRESHOLD_DAYS || '7', 10),
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
  N8N_STALE_WEBHOOK_URL: process.env.N8N_STALE_WEBHOOK_URL || ''
};
