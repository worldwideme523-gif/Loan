import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createRepaymentRequest,
  getUserRepaymentRequests
} from '../controller/repaymentController.js';

const router = express.Router();

router.post('/request', protect, createRepaymentRequest);
router.get('/my-requests', protect, getUserRepaymentRequests);

export default router;