import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboard,
  updateWalletAddress,
  transferToWallet,
  contactAdmin
} from '../controller/userController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.put('/wallet-address', protect, updateWalletAddress);
router.post('/transfer-to-wallet', protect, transferToWallet);
router.post('/contact-admin', protect, contactAdmin);

export default router;