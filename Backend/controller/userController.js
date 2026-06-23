import User from '../models/User.js';
import Loan from '../models/Loan.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Get user dashboard (profile + loan info)
// @route   GET /api/user/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const loan = await Loan.findOne({
      userId: req.user._id,
      status: { $in: ['approved', 'withdrawn', 'repaid'] }
    });

    let countdown = null;
    if (loan && loan.withdrawalAvailableDate && loan.status === 'approved') {
      const now = new Date();
      const withdrawDate = new Date(loan.withdrawalAvailableDate);
      const daysLeft = Math.ceil((withdrawDate - now) / (1000 * 60 * 60 * 24));
      countdown = daysLeft > 0 ? daysLeft : 0;
    }

    res.json({ user, loan, countdown });
  } catch (error) {
    next(error);
  }
};

// @desc    Send email to admin from user dashboard
// @route   POST /api/user/contact-admin
export const contactAdmin = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const user = req.user;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `FoyerLibre: ${subject}`,
      text: `From: ${user.name} (${user.email})\n\n${message}`
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    next(error);
  }
};
