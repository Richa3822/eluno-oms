import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertsService {
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

    async sendBreachAlert(params: {
        orderId: string;
        customerName: string;
        storeLocation: string;
        lensType: string;
        status: string;
        riskBand: string;
        reason: string;
        hoursRemaining: number;
    }) {
        const { orderId, customerName, storeLocation, lensType, status, riskBand, reason, hoursRemaining } = params;

        const subject = `⚠️ SLA Breach Risk: ${riskBand} — Order for ${customerName}`;

        const html = `
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

        try {
            await this.transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: process.env.ALERT_RECIPIENT_EMAIL,
                subject,
                html,
            });
            return { sent: true, channel: 'email' };
        } catch (error) {
            console.error('Failed to send email alert:', error);
            return { sent: false, channel: 'email', error: (error as Error).message };
        }
    }
}