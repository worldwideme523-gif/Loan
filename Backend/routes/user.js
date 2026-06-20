import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboard,
  contactAdmin
} from '../controller/userController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.post('/contact-admin', protect, contactAdmin);

export default router;