import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  // Mock transport fallback for local development
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  console.warn('WARNING: SMTP configs are missing. Using mock JSON mailer (outputs to console log).');
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Trackathon" <no-reply@trackathon.dev>',
      to,
      subject,
      html,
    });
    
    // Log the JSON mail output for debugging
    if ('jsonTransport' in transporter.options && transporter.options.jsonTransport) {
      console.log('--- MOCK EMAIL BEGIN ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('Body:', (info as any).message);
      console.log('--- MOCK EMAIL END ---');
    }
    return info;
  } catch (error) {
    console.error('Nodemailer Error: Failed to send email:', error);
    throw error;
  }
};
export default transporter;
