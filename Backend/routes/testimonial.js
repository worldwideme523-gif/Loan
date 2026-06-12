import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTestimonials, userCreateTestimonial } from '../controller/testimonialController.js';

const router = express.Router();

// Public route – anyone can see testimonials
router.get('/', getTestimonials);

// Protected route – only logged-in users can add a testimonial
router.post('/user', protect, userCreateTestimonial);

export default router;