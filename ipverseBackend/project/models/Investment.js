const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Investor is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  tokensInvested: {
    type: Number,
    required: [true, 'Number of tokens is required'],
    min: [1, 'Must invest at least 1 token']
  },
  investmentAmount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [0.01, 'Investment amount must be at least $0.01']
  },
  pricePerToken: {
    type: Number,
    required: [true, 'Price per token is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'crypto', 'wallet'],
    required: [true, 'Payment method is required']
  },
  returnOnInvestment: {
    type: Number,
    default: 0
  },
  dividendsReceived: {
    type: Number,
    default: 0
  },
  investmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
investmentSchema.index({ investor: 1, project: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ investmentDate: -1 });

// Virtual for investment percentage of project
investmentSchema.virtual('ownershipPercentage').get(function() {
  // This would need to be calculated based on total project tokens
  return 0; // Placeholder - implement logic based on project data
});

module.exports = mongoose.model('Investment', investmentSchema);