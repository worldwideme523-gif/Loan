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

    // Send email notification
   // Send email notification (but don't fail approval if email fails)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Loan Application Approved',
        text: `Dear ${user.name},\n\nYour loan application for ₦${application.amount.toLocaleString()} has been approved!\n\nFunds have been added to your account. They will be available after the standard processing period.\n\nThank you for choosing our platform.`
      });
    } catch (emailError) {
      console.error('Email sending failed, but loan approved:', emailError.message);
      // Continue – the approval is already successful
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
        subject: 'Loan Application Denied',
        text: `Dear ${user.name},\n\nWe regret to inform you that your loan application has been denied.\n\nPlease contact support for more information.`
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