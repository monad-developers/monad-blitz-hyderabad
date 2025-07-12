const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['Music', 'Games', 'Characters', 'Art', 'Patents','Culture','Technology','Antiques']
  },
  ipType: {
    type: String,
    required: [true, 'IP type is required'],
    enum: ['utility_patent', 'design_patent', 'trademark', 'copyright', 'trade_secret']
  },
  totalTokens: {
    type: Number,
    required: [true, 'Total tokens is required'],
    min: [1, 'Must have at least 1 token']
  },
  tokenPrice: {
    type: Number,
    required: [true, 'Token price is required'],
    min: [0.01, 'Token price must be at least $0.01']
  },
  soldTokens: {
    type: Number,
    default: 0
  },
  availableTokens: {
    type: Number
  },
  fundingGoal: {
    type: Number,
  },
  currentFunding: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'funded', 'closed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  images: [{
    type: String
  }],
  documents: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  expectedReturns: {
    type: Number,
    min: [0, 'Expected returns cannot be negative'],
    max: [100, 'Expected returns cannot exceed 100%']
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Calculate available tokens before saving
projectSchema.pre('save', function(next) {
  this.availableTokens = this.totalTokens - this.soldTokens;
  next();
});

// Virtual for funding percentage
projectSchema.virtual('fundingPercentage').get(function() {
  return this.fundingGoal > 0 ? (this.currentFunding / this.fundingGoal) * 100 : 0;
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);