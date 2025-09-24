// services/notify.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const hasEmail = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const hasSms = !!((process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID) && (process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH) && (process.env.TWILIO_PHONE_FROM || process.env.TWILIO_FROM));

let transporter = null;
if (hasEmail) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

let smsClient = null;
if (hasSms) {
smsClient = twilio(process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH);
}

export async function sendEmail(to, subject, text, html) {
  if (!hasEmail) {
    console.log('[notify] Email disabled (missing SMTP env). Would send to', to, subject);
    return { disabled: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@quickfix.local',
      to,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.warn('[notify] Email send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

export async function sendSMS(to, body) {
  if (!hasSms) {
    console.log('[notify] SMS disabled (missing Twilio env). Would send to', to, body);
    return { disabled: true };
  }
  try {
await smsClient.messages.create({ to, from: (process.env.TWILIO_PHONE_FROM || process.env.TWILIO_FROM), body });
    return { ok: true };
  } catch (err) {
    console.warn('[notify] SMS send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

export async function notifyBookingCreated(booking) {
  const subject = `Booking received - ${booking.serviceType || 'Service'}`;
  const text = `Hi ${booking.name || ''}, your booking has been received. We'll contact you soon. Booking ID: ${booking._id}`;
  const html = `<p>Hi ${booking.name || ''},</p><p>Your booking has been received. We'll contact you soon.</p><p><strong>Booking ID:</strong> ${booking._id}</p>`;
  if (booking.email) await sendEmail(booking.email, subject, text, html);
  if (booking.phone) await sendSMS(booking.phone, `QuickFix: Booking received. ID: ${booking._id}`);
}

export async function notifyBookingStatusChange(booking) {
  const subject = `Booking ${booking._id} status updated: ${booking.status}`;
  const text = `Your booking status is now ${booking.status}.`;
  const html = `<p>Your booking status is now <strong>${booking.status}</strong>.</p>`;
  if (booking.email) await sendEmail(booking.email, subject, text, html);
  if (booking.phone) await sendSMS(booking.phone, `QuickFix: Booking ${booking._id} -> ${booking.status}`);
}