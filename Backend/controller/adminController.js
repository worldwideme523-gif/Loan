import User from '../models/User.js';
import Loan from '../models/Loan.js';
import LoanApplication from '../models/LoanApplication.js';
import RepaymentRequest from '../models/RepaymentRequest.js';
import { sendEmail } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loan applications
export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await LoanApplication.find().populate('userId', 'name email');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a loan application (credits user wallet automatically)
export const approveLoan = async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    const user = await User.findById(application.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create loan record
    const loan = new Loan({
      userId: application.userId,
      applicationId: application._id,
      approvedAmount: application.amount,
      termMonths: application.termMonths
    });
    await loan.save();

    // Credit user wallet (this is the "add funds" part for the user)
    user.walletBalance += application.amount;
    await user.save();

    // Update application status
    application.status = 'approved';
    await application.save();

    // Send email notification with professional HTML
    try {
      await sendEmail({
        to: user.email,
        subject: 'Loan Application Approved - Funds Credited',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Loan Approved!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Congratulations, your loan has been approved</p>
            </div>
            <div style="padding: 32px;">
              <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">Dear ${user.name},</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">We are pleased to inform you that your loan application for <strong style="color: #059669;">$${application.amount.toLocaleString()}</strong> has been <strong style="color: #059669;">approved</strong>!</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-size: 14px;">Approved Amount</td>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 700; text-align: right;">$${application.amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-size: 14px; border-top: 1px solid #bbf7d0;">Term</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; border-top: 1px solid #bbf7d0;">${application.termMonths} months</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-size: 14px; border-top: 1px solid #bbf7d0;">Status</td>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #bbf7d0;">Funds Credited ✅</td>
                  </tr>
                </table>
              </div>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Funds have been added to your account. They will be available for withdrawal after the standard 90-day processing period.</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Please log in to your dashboard to view your loan details and track your withdrawal availability.</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.FRONTEND_URL || 'https://foyerlibre.com'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">Go to Dashboard</a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Best regards,<br/>The FoyerLibre Team</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed, but loan approved:', emailError.message);
    }

    res.json({ message: 'Loan approved and account credited successfully', loan });
  } catch (error) {
    console.error('Approve loan error:', error);
    next(error);
  }
};

// @desc    Deny a loan application
export const denyLoan = async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    application.status = 'denied';
    await application.save();

    const user = await User.findById(application.userId);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Loan Application Update',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">📋</div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Application Update</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Regarding your recent loan application</p>
            </div>
            <div style="padding: 32px;">
              <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">Dear ${user.name},</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">After careful review, we regret to inform you that your loan application for <strong>$${application.amount.toLocaleString()}</strong> has been <strong style="color: #dc2626;">denied</strong> at this time.</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you have any questions or would like more information about this decision, please don't hesitate to contact our support team.</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">We encourage you to reapply in the future once the requirements are met.</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Best regards,<br/>The FoyerLibre Team</p>
            </div>
          </div>
        `
      });
    }

    res.json({ message: 'Loan application denied' });
  } catch (error) {
    console.error('Deny loan error:', error);
    next(error);
  }
};

// @desc    Add funds to a user's wallet (admin manual credit)
export const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.walletBalance += amount;
    await user.save();

    res.json({
      message: `Added ₦${amount} to ${user.name}'s account`,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Add funds error:', error);
    next(error);
  }
};

// @desc    Delete a user (superadmin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new admin (superadmin only)
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      phone: 'N/A',
      houseAddress: 'N/A',
      officeAddress: 'N/A',
      role: role || 'admin',
      walletBalance: 0
    });

    await admin.save();

    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending repayment requests
export const getRepaymentRequests = async (req, res, next) => {
  try {
    const requests = await RepaymentRequest.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('loanId');
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a repayment request as received
export const markRepaymentReceived = async (req, res, next) => {
  try {
    const request = await RepaymentRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'received';
    await request.save();

    const loan = await Loan.findById(request.loanId);
    if (loan) {
      loan.remainingDebt -= request.amount;
      if (loan.remainingDebt <= 0) {
        loan.status = 'repaid';
      }
      await loan.save();
    }

    res.json({ message: 'Repayment marked as received' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin sends email to a user
export const adminSendEmailToUser = async (req, res, next) => {
  try {
    const { userId, subject, message } = req.body;
    if (!userId || !subject || !message) {
      return res.status(400).json({ message: 'userId, subject, and message are required' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const adminName = req.user.name;

    await sendEmail({
      to: targetUser.email,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">📬</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">FoyerLibre Update</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">Dear ${targetUser.name},</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">${message}</p>
            </div>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you have any questions, please don't hesitate to reach out to us.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Best regards,<br/>${adminName}<br/>The FoyerLibre Team</p>
          </div>
        </div>
      `
    });

    res.json({ message: `Email sent to ${targetUser.name} successfully` });
  } catch (error) {
    next(error);
  }
};