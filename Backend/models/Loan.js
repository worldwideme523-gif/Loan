import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanApplication'
  },
  approvedAmount: {
    type: Number,
    required: true
  },
  termMonths: {
    type: Number,
    required: true,
    enum: [6, 12, 24]
  },
  interestRate: Number,
  totalPayable: Number,
  remainingDebt: Number,
  approvalDate: {
    type: Date,
    default: Date.now
  },
  withdrawalAvailableDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'withdrawn', 'repaid', 'defaulted'],
    default: 'pending'
  },
  withdrawnToWallet: {
    type: Boolean,
    default: false
  }
});

// ✅ FIX: Use async function without calling next()
loanSchema.pre('save', async function() {
  if (this.isNew) {
    let rate;
    if (this.termMonths === 6) rate = 0.07;
    else if (this.termMonths === 12) rate = 0.10;
    else rate = 0.15;
    
    this.interestRate = rate;
    this.totalPayable = this.approvedAmount + (this.approvedAmount * rate);
    this.remainingDebt = this.totalPayable;
    this.withdrawalAvailableDate = new Date(this.approvalDate);
    this.withdrawalAvailableDate.setDate(this.withdrawalAvailableDate.getDate() + 90);
  }
});

export default mongoose.model('Loan', loanSchema);