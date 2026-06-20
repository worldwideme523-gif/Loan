import RepaymentRequest from '../models/RepaymentRequest.js';
import Loan from '../models/Loan.js';

// @desc    Create a repayment request
// @route   POST /api/repayment/request
export const createRepaymentRequest = async (req, res, next) => {
  try {
    const { loanId, amount } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    if (loan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (amount <= 0 || amount > loan.remainingDebt) {
      return res.status(400).json({ message: 'Invalid repayment amount' });
    }

    const request = new RepaymentRequest({
      userId: req.user._id,
      loanId,
      amount
    });

    await request.save();

    res.status(201).json({ message: 'Repayment request submitted. Admin will verify.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's repayment requests
// @route   GET /api/repayment/my-requests
export const getUserRepaymentRequests = async (req, res, next) => {
  try {
    const requests = await RepaymentRequest.find({ userId: req.user._id });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};