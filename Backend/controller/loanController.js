import LoanApplication from '../models/LoanApplication.js';
import Loan from '../models/Loan.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// Apply for a loan
export const applyForLoan = async (req, res, next) => {
  try {
    const { amount, termMonths, purpose } = req.body;

    // Validation
    if (amount < 100000 || amount > 20000000) {
      return res.status(400).json({ message: 'Loan amount must be between ₦100,000 and ₦20,000,000' });
    }
    if (![6,12,24].includes(termMonths)) {
      return res.status(400).json({ message: 'Term must be 6, 12, or 24 months' });
    }

    // Check existing active loan
    const existingLoan = await Loan.findOne({ 
      userId: req.user._id, 
      status: { $in: ['approved', 'withdrawn'] } 
    });
    if (existingLoan) {
      return res.status(400).json({ message: 'You already have an active loan' });
    }

    // Check pending application
    const pendingApp = await LoanApplication.findOne({ 
      userId: req.user._id, 
      status: 'pending' 
    });
    if (pendingApp) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const application = new LoanApplication({
      userId: req.user._id,
      amount,
      termMonths,
      purpose
    });

    await application.save();
    res.status(201).json({ message: 'Loan application submitted successfully', application });
  } catch (error) {
    next(error);
  }
};

// Apply for loan from calculator (with admin notification)
export const applyFromCalculator = async (req, res, next) => {
  try {
    const { amount, termMonths } = req.body;

    if (amount < 100000 || amount > 20000000) {
      return res.status(400).json({ message: 'Loan amount must be between $100,000 and $20,000,000' });
    }
    if (![6, 12, 24].includes(termMonths)) {
      return res.status(400).json({ message: 'Term must be 6, 12, or 24 months' });
    }

    const existingLoan = await Loan.findOne({
      userId: req.user._id,
      status: { $in: ['approved', 'withdrawn'] }
    });
    if (existingLoan) {
      return res.status(400).json({ message: 'You already have an active loan' });
    }

    const pendingApp = await LoanApplication.findOne({
      userId: req.user._id,
      status: 'pending'
    });
    if (pendingApp) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const application = new LoanApplication({
      userId: req.user._id,
      amount,
      termMonths,
      purpose: 'Calculator Application'
    });

    await application.save();

    // Notify all admins via email
    try {
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      const user = req.user;

      const getRate = (months) => {
        const rates = { 6: 0.07, 12: 0.10, 24: 0.15 };
        return rates[months] || 0.15;
      };

      const rate = getRate(termMonths);
      const interest = amount * rate;
      const totalRepayment = amount + interest;
      const monthlyPayment = totalRepayment / termMonths;

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">📋</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Loan Application</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">A user has applied for a loan via the calculator</p>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <tr style="background: #f1f5f9;">
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Applicant</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Email</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${user.email}</td>
              </tr>
              <tr style="background: #f1f5f9;">
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Loan Amount</td>
                <td style="padding: 16px 24px; color: #059669; font-size: 16px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">$${amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Term</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${termMonths} months</td>
              </tr>
              <tr style="background: #f1f5f9;">
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Interest Rate</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0;">${(rate * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Monthly Payment</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0;">$${monthlyPayment.toLocaleString()}</td>
              </tr>
              <tr style="background: #f1f5f9;">
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Total Repayment</td>
                <td style="padding: 16px 24px; color: #dc2626; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">$${totalRepayment.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 16px 24px; font-weight: 600; color: #475569; font-size: 14px;">Date Applied</td>
                <td style="padding: 16px 24px; color: #0f172a; font-size: 14px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="text-align: center; margin-top: 28px;">
              <a href="${process.env.FRONTEND_URL || 'https://foyerlibre.com'}/admin" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(59,130,246,0.4);">Review in Admin Dashboard</a>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated notification from FoyerLibre.</p>
          </div>
        </div>
      `;

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Loan Application - $${amount.toLocaleString()} from ${user.name}`,
          html: emailHtml
        });
      }
      console.log(`Admins notified about new application from ${user.name}`);
    } catch (emailError) {
      console.error('Failed to notify admins:', emailError.message);
    }

    res.status(201).json({ message: 'Loan application submitted successfully! An admin will review your application shortly.', application });
  } catch (error) {
    next(error);
  }
};

// Get user's loan applications
export const getUserApplications = async (req, res, next) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user._id });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// Get user's active loan
export const getUserActiveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ 
      userId: req.user._id, 
      status: { $in: ['approved', 'withdrawn', 'repaid'] } 
    });
    res.json(loan);
  } catch (error) {
    next(error);
  }
};