import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let transporter: Transporter;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
};

const baseTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a2744; padding: 30px; text-align: center; }
    .header h1 { color: #C8A96E; margin: 0; font-size: 24px; }
    .body { padding: 30px; color: #333; line-height: 1.6; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .btn { display: inline-block; background: #C8A96E; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    td:first-child { font-weight: bold; color: #555; width: 35%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>CoreX Ventures</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} CoreX Ventures. All rights reserved.</div>
  </div>
</body>
</html>`;

const send = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await getTransporter().sendMail({ from: config.smtp.from, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email failed to ${to}`, err);
  }
};

// ─── Contact Emails ───────────────────────────────────────────────────────────

export const sendContactConfirmation = async (name: string, email: string, subject: string): Promise<void> => {
  const html = baseTemplate(`
    <p>Dear ${name},</p>
    <p>Thank you for reaching out to CoreX Ventures. We have received your message regarding <strong>"${subject}"</strong>.</p>
    <p>Our team will review your inquiry and get back to you within <strong>1–2 business days</strong>.</p>
    <p>Best regards,<br>CoreX Ventures Team</p>
  `);
  await send(email, 'We received your message – CoreX Ventures', html);
};

export const sendContactAdminNotification = async (data: {
  name: string; email: string; phone?: string;
  subject: string; division: string; message: string;
}): Promise<void> => {
  const html = baseTemplate(`
    <p>A new contact form submission has been received:</p>
    <table>
      <tr><td>Name</td><td>${data.name}</td></tr>
      <tr><td>Email</td><td>${data.email}</td></tr>
      <tr><td>Phone</td><td>${data.phone || 'N/A'}</td></tr>
      <tr><td>Subject</td><td>${data.subject}</td></tr>
      <tr><td>Division</td><td>${data.division}</td></tr>
      <tr><td>Message</td><td>${data.message}</td></tr>
    </table>
  `);
  await send(config.smtp.adminEmail, `New Contact: ${data.subject}`, html);
};

// ─── Inquiry Emails ───────────────────────────────────────────────────────────

export const sendInquiryConfirmation = async (contactPerson: string, email: string, company: string): Promise<void> => {
  const html = baseTemplate(`
    <p>Dear ${contactPerson},</p>
    <p>Thank you for submitting a business inquiry on behalf of <strong>${company}</strong>.</p>
    <p>Our team will carefully review your project requirements and respond within <strong>2–3 business days</strong>.</p>
    <p>Best regards,<br>CoreX Ventures Business Development Team</p>
  `);
  await send(email, 'Inquiry Received – CoreX Ventures', html);
};

export const sendInquiryAdminNotification = async (data: {
  company: string; contactPerson: string; email: string; phone: string;
  division: string; projectType: string; budget?: string; timeline?: string; description: string;
}): Promise<void> => {
  const html = baseTemplate(`
    <p>A new business inquiry has been submitted:</p>
    <table>
      <tr><td>Company</td><td>${data.company}</td></tr>
      <tr><td>Contact</td><td>${data.contactPerson}</td></tr>
      <tr><td>Email</td><td>${data.email}</td></tr>
      <tr><td>Phone</td><td>${data.phone}</td></tr>
      <tr><td>Division</td><td>${data.division}</td></tr>
      <tr><td>Project Type</td><td>${data.projectType}</td></tr>
      <tr><td>Budget</td><td>${data.budget || 'N/A'}</td></tr>
      <tr><td>Timeline</td><td>${data.timeline || 'N/A'}</td></tr>
      <tr><td>Description</td><td>${data.description}</td></tr>
    </table>
  `);
  await send(config.smtp.adminEmail, `New Inquiry: ${data.company} – ${data.projectType}`, html);
};
