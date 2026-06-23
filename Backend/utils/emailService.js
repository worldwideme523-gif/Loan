import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@foyerlibre.com';
const FROM_NAME = 'FoyerLibre';

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 Email would be sent to ${to} with subject "${subject}"`);
    console.log(`   Content: ${text?.substring(0, 100) || ''}...`);
    return { message: 'Email not sent (no RESEND_API_KEY), but operation continues' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text?.replace(/\n/g, '<br>'),
    });

    if (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return { error: error.message };
    }

    console.log(`✅ Email sent to ${to} - ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { error: error.message };
  }
};
