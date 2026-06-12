import User from '../models/User.js';
import Loan from '../models/Loan.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Get user dashboard (profile + loan info + countdown)
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

// @desc    Update user's external crypto wallet address
// @route   PUT /api/user/wallet-address
export const updateWalletAddress = async (req, res, next) => {
  try {
    const { externalWalletAddress } = req.body;
    await User.findByIdAndUpdate(req.user._id, { externalWalletAddress });
    res.json({ message: 'Wallet address updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer approved loan to external wallet (after 90 days)
// @route   POST /api/user/transfer-to-wallet
export const transferToWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const loan = await Loan.findOne({
      userId: req.user._id,
      status: 'approved',
      withdrawnToWallet: false
    });

    if (!loan) {
      return res.status(400).json({ message: 'No approved loan found' });
    }

    const now = new Date();
    if (now < loan.withdrawalAvailableDate) {
      const daysLeft = Math.ceil((loan.withdrawalAvailableDate - now) / (1000 * 60 * 60 * 24));
      return res.status(400).json({ message: `Cannot withdraw yet. Wait ${daysLeft} more days` });
    }

    if (!user.externalWalletAddress) {
      return res.status(400).json({ message: 'Please set your external wallet address first' });
    }

    if (user.walletBalance < loan.approvedAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Process transfer
    user.walletBalance -= loan.approvedAmount;
    loan.withdrawnToWallet = true;
    loan.status = 'withdrawn';

    await user.save();
    await loan.save();

    res.json({ message: `Successfully transferred ₦${loan.approvedAmount} to ${user.externalWalletAddress}` });
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
      subject: `Loan Platform: ${subject}`,
      text: `From: ${user.name} (${user.email})\n\n${message}`
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    next(error);
  }
};