import LoanApplication from '../models/LoanApplication.js';
import Loan from '../models/Loan.js';

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