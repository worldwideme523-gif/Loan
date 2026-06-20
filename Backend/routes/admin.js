import express from 'express';
import { protect, admin, superAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  getAllApplications,
  approveLoan,
  denyLoan,
  addFunds,
  deleteUser,
  createAdmin,
  getRepaymentRequests,
  markRepaymentReceived
} from '../controller/adminController.js';
import {
  getAllTestimonials,
  deleteTestimonial,
  adminCreateTestimonial
} from '../controller/testimonialController.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/applications', getAllApplications);
router.post('/approve-loan/:applicationId', approveLoan);
router.post('/deny-loan/:applicationId', denyLoan);
router.post('/add-funds/:userId', addFunds);
router.get('/repayment-requests', getRepaymentRequests);
router.post('/repayment-received/:requestId', markRepaymentReceived);

// Testimonial management
router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', adminCreateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Super admin only
router.delete('/user/:userId', superAdmin, deleteUser);
router.post('/create-admin', superAdmin, createAdmin);


export default router;
