import Testimonial from '../models/Testimonial.js';

// Sample data (only used if the database is completely empty)
const testimonialSamples = [
  {
    author: 'John D.',
    content: 'The loan process was incredibly smooth! Got approved within a week and the 90-day waiting period was clearly communicated. Highly recommended!',
    rating: 5,
    loanAmount: 500000,
    isActive: true
  },
  {
    author: 'Sarah M.',
    content: "Best loan platform I've used. The team is responsive and the repayment process is straightforward.",
    rating: 5,
    loanAmount: 2000000,
    isActive: true
  },
  {
    author: 'Michael K.',
    content: 'Transparent rates and no hidden fees. The 90-day hold gave me time to plan my investment strategy.',
    rating: 4,
    loanAmount: 750000,
    isActive: true
  },
  {
    author: 'Emily R.',
    content: 'Quick approval and excellent customer support. Will definitely use again!',
    rating: 5,
    loanAmount: 1500000,
    isActive: true
  }
];

// @desc    Get all active testimonials (public)
// @route   GET /api/testimonials
export const getTestimonials = async (req, res) => {
  try {
    let testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // If no testimonials exist, seed the database with sample data
    if (!testimonials.length) {
      await Testimonial.insertMany(testimonialSamples);
      testimonials = await Testimonial.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Return a plain array – the frontend expects this
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({ message: 'Error fetching testimonials' });
  }
};

// @desc    Create a testimonial as a logged-in user (uses the user's name from JWT)
// @route   POST /api/testimonials/user
export const userCreateTestimonial = async (req, res) => {
  try {
    const { content, rating, loanAmount } = req.body;
    const author = req.user.name;  // from the protect middleware

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const testimonial = new Testimonial({
      author: author.trim(),
      content: content.trim(),
      rating: Math.min(Math.max(rating, 1), 5),
      loanAmount: loanAmount ? parseInt(loanAmount) : 0,
      isActive: true   // auto-approved; you can later add admin moderation
    });

    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ message: 'Error creating testimonial' });
  }
};