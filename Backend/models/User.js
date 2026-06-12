import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  phone: {
    type: String,
    required: true
  },
  houseAddress: {
    type: String,
    required: false,
    default: 'N/A'
  },
  officeAddress: {
    type: String,
    required: false,
    default: 'N/A'
  },
  documents: {
    dobCertificate: String,
    driversLicense: String,
    passport: String
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  externalWalletAddress: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);