import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  // If already created, return it
  if (transporter) return transporter;

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials missing. Emails will not be sent.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  
  // If no transporter (missing credentials or creation failed), just log and return
  if (!transporter) {
    console.log(`📧 Email would be sent to ${to} with subject "${subject}"`);
    console.log(`   Content: ${text?.substring(0, 100)}...`);
    return { message: 'Email not sent (no credentials), but operation continues' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"FoyerLibre" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text?.replace(/\n/g, '<br>'),
    });
    console.log(`✅ Email sent to ${to} - Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    // Do NOT throw error – just log and return gracefully
    return { error: error.message };
  }
};