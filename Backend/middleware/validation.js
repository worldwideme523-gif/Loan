import { body, validationResult } from 'express-validator';

// Validation for user registration
export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number required'),
  body('houseAddress').notEmpty().withMessage('House address required'),
  body('officeAddress').notEmpty().withMessage('Office address required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for loan application
export const validateLoanApplication = [
  body('amount').isInt({ min: 100000, max: 20000000 }).withMessage('Amount must be between 100,000 and 20,000,000'),
  body('termMonths').isIn([6, 12, 24]).withMessage('Term must be 6, 12, or 24 months'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];