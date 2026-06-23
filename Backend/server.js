import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';


// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import loanRoutes from './routes/loan.js';
import repaymentRoutes from './routes/repayment.js';
import testimonialRoutes from './routes/testimonial.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Fix DNS resolution for environments where Node.js c-ares can't use system DNS
try {
  const servers = dns.getServers();
  if (servers.length === 1 && servers[0] === '127.0.0.1') {
    dns.setServers(['10.0.0.243', '8.8.8.8', '8.8.4.4']);
  }
} catch (_) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5174',
  'https://loan-zeta-self.vercel.app',
  'https://loan-o6dv519nw-ward-s-projects2.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const uri = process.env.MONGODB_URI;
if (uri) {
  mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not set, skipping database connection');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/repayment', repaymentRoutes);
app.use('/api/testimonials', testimonialRoutes);




// ... after all routes
app.use(errorHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});