import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateLoanApplication } from '../middleware/validation.js';
import {
  applyForLoan,
  applyFromCalculator,
  getUserApplications,
  getUserActiveLoan
} from '../controller/loanController.js';

const router = express.Router();

router.post('/apply', protect, validateLoanApplication, applyForLoan);
router.post('/apply-from-calculator', protect, validateLoanApplication, applyFromCalculator);
router.get('/my-applications', protect, getUserApplications);
router.get('/my-loan', protect, getUserActiveLoan);

export default router;