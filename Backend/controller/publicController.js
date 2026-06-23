import { sendEmail } from '../utils/emailService.js';

export const visitorContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `FoyerLibre Contact: ${subject || 'New Message from Visitor'}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">New Contact Message</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #475569; font-size: 14px; font-weight: 600; width: 100px;">Name</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #475569; font-size: 14px; font-weight: 600;">Email</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
              </tr>
              ${subject ? `<tr>
                <td style="padding: 8px 0; color: #475569; font-size: 14px; font-weight: 600;">Subject</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${subject}</td>
              </tr>` : ''}
            </table>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 16px;">
              <p style="color: #475569; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Message:</p>
              <p style="color: #0f172a; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `
    });

    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    next(error);
  }
};
