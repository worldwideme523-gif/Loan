import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100000,
    max: 20000000
  },
  termMonths: {
    type: Number,
    required: true,
    enum: [6, 12, 24]
  },
  purpose: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  adminComment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('LoanApplication', loanApplicationSchema);