/**
 * Email Notification Service
 * Dispatches automated Stale Deal Alerts and Manager Escalations via Gmail SMTP.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailNotificationService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const user = config.GMAIL_USER;
    const pass = config.GMAIL_APP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        }
      });
      console.log(`[Email Service] Connected to live Gmail account: ${user}`);
    } else {
      this.transporter = null;
      console.log('[Email Service] Gmail credentials not provided. Running in simulation mode.');
    }
  }

  /**
   * Dispatch Stale Deal Follow-up Alert to Sales Rep
   */
  async sendStaleDealAlert(deal, daysInactive, task) {
    if (!deal || !deal.ownerEmail) return;

    const sender = config.GMAIL_USER || 'crm-automation@company.com';
    const mailOptions = {
      from: `"Stale Deal Recovery Engine" <${sender}>`,
      to: deal.ownerEmail,
      subject: `🚨 STALE DEAL ALERT: ${deal.title} ($${deal.amount.toLocaleString()}) - ${daysInactive} Days Untouched`,
      text: `
Hello ${deal.ownerName},

Your deal "${deal.title}" with ${deal.company} has been sitting untouched for ${daysInactive} days in ${deal.stage} stage.
Pipeline Value: $${deal.amount.toLocaleString()}

An automated follow-up task has been generated: "${task.title}".
Please contact ${deal.contactName} (${deal.contactEmail}) immediately to re-activate this deal.

Log in to the CRM Console to execute the re-engagement touchpoint:
http://localhost:5177
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: #ffffff; padding: 10px 16px; border-radius: 6px; font-weight: bold; font-size: 15px; margin-bottom: 16px;">
            🚨 Action Required: Deal Untouched for ${daysInactive} Days
          </div>
          <p style="font-size: 14px; color: #0f172a;">
            Hi <strong>${deal.ownerName}</strong>, your deal has exceeded the 7-day inactivity threshold.
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; background: #f8fafc; padding: 12px; border-radius: 6px;">
            <tr><td style="padding: 6px; font-weight: bold; width: 120px; color: #64748b;">Deal Title:</td><td style="font-weight: bold; color: #0f172a;">${deal.title}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #64748b;">Company:</td><td>${deal.company}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #64748b;">Pipeline Value:</td><td style="color: #059669; font-weight: bold;">$${deal.amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #64748b;">Current Stage:</td><td>${deal.stage}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #64748b;">Days Inactive:</td><td style="color: #dc2626; font-weight: bold;">${daysInactive} days</td></tr>
            <tr><td style="padding: 6px; font-weight: bold; color: #64748b;">Contact:</td><td>${deal.contactName} &lt;<a href="mailto:${deal.contactEmail}">${deal.contactEmail}</a>&gt;</td></tr>
          </table>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px; font-size: 13px; color: #1e40af; margin-bottom: 16px;">
            <strong>Auto-Generated Task:</strong> ${task.title}
          </div>
          <p style="font-size: 12px; color: #94a3b8;">
            Dispatched by the Enterprise Stale Deal Recovery Engine.
          </p>
        </div>
      `
    };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`[Email Service] Stale deal alert sent to ${deal.ownerEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error('[Email Service] Failed to send email alert:', err.message);
      }
    }
  }

  /**
   * Dispatch Manager Escalation Alert
   */
  async sendManagerEscalation(deal, reason) {
    const sender = config.GMAIL_USER || 'crm-automation@company.com';
    const managerEmail = config.GMAIL_USER || 'manager@company.com';

    const mailOptions = {
      from: `"Stale Deal Recovery Escalations" <${sender}>`,
      to: managerEmail,
      subject: `⚠️ MANAGER ESCALATION: Stalled Deal "${deal.title}" ($${deal.amount.toLocaleString()})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fed7aa; border-radius: 8px;">
          <h3 style="color: #c2410c;">⚠️ Manager Escalation Triggered</h3>
          <p>The following high-priority deal has stalled with no rep outreach:</p>
          <p><strong>Deal:</strong> ${deal.title} ($${deal.amount.toLocaleString()})<br/>
             <strong>Assigned Owner:</strong> ${deal.ownerName} (${deal.ownerEmail})<br/>
             <strong>Escalation Reason:</strong> ${reason}</p>
        </div>
      `
    };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`[Email Service] Manager escalation sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error('[Email Service] Failed to send escalation email:', err.message);
      }
    }
  }
}

module.exports = new EmailNotificationService();
