import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface BreachAlertParams {
  orderId: string;
  customerName: string;
  storeLocation: string;
  lensType: string;
  status: string;
  riskBand: string;
  reason: string;
  hoursRemaining: number;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  // Gmail SMTP fallback — used for local dev. On hosts that block outbound
  // SMTP (e.g. Railway free/hobby plans), set RESEND_API_KEY to send over
  // HTTPS instead.
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Workaround for local dev: antivirus/corporate SSL inspection (e.g. AVG)
    // injects a self-signed cert into the TLS chain. Safe to remove in
    // production environments without SSL-inspecting software.
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendBreachAlert(params: BreachAlertParams) {
    const recipient = process.env.ALERT_RECIPIENT_EMAIL;
    if (!recipient) {
      this.logger.warn('ALERT_RECIPIENT_EMAIL not set — skipping breach alert email.');
      return { sent: false, channel: 'none', error: 'ALERT_RECIPIENT_EMAIL not configured' };
    }

    const subject = `⚠️ SLA Breach Risk: ${params.riskBand} — Order for ${params.customerName}`;
    const html = this.buildHtml(params);

    // Prefer Resend (HTTPS, never blocked by hosts) when configured.
    if (process.env.RESEND_API_KEY) {
      return this.sendViaResend(recipient, subject, html);
    }

    return this.sendViaSmtp(recipient, subject, html);
  }

  private async sendViaResend(to: string, subject: string, html: string) {
    const from = process.env.RESEND_FROM || 'Eluno OMS <onboarding@resend.dev>';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Resend API error (${res.status}): ${body}`);
        return { sent: false, channel: 'resend', error: `Resend ${res.status}: ${body}` };
      }

      return { sent: true, channel: 'resend' };
    } catch (error) {
      this.logger.error('Failed to send email via Resend:', error as Error);
      return { sent: false, channel: 'resend', error: (error as Error).message };
    }
  }

  private async sendViaSmtp(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
      });
      return { sent: true, channel: 'email' };
    } catch (error) {
      this.logger.error('Failed to send email via SMTP:', error as Error);
      return { sent: false, channel: 'email', error: (error as Error).message };
    }
  }

  private buildHtml(params: BreachAlertParams) {
    const { orderId, customerName, storeLocation, lensType, status, riskBand, reason, hoursRemaining } = params;
    return `
      <h2>SLA Breach Alert</h2>
      <p><strong>Risk Level:</strong> ${riskBand}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Store:</strong> ${storeLocation}</p>
      <p><strong>Lens Type:</strong> ${lensType}</p>
      <p><strong>Current Status:</strong> ${status}</p>
      <p><strong>Hours Remaining:</strong> ${hoursRemaining}</p>
      <p><strong>AI Analysis:</strong> ${reason}</p>
      <hr/>
      <p style="color:#888;font-size:12px;">Sent automatically by Eluno OMS — Breach Prediction System</p>
    `;
  }
}
