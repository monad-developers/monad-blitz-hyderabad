const Investment = require('../../models/Investment');
const Project = require('../../models/Project');
const User = require('../../models/User');
const { validationResult } = require('express-validator');

// Create Investment
const createInvestment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { projectId, tokensInvested, paymentMethod } = req.body;
    const userId = req.user._id;

    // Check if project exists and is not cancelled
    const project = await Project.findOne({ _id: projectId, status: { $ne: 'cancelled' } });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not available for investment'
      });
    }

    // Check if enough tokens are available
    if (tokensInvested > project.availableTokens) {
      return res.status(400).json({
        success: false,
        message: `Only ${project.availableTokens} tokens available`
      });
    }

    // Calculate investment amount
    const investmentAmount = tokensInvested * project.tokenPrice;

    // Check if user has sufficient balance (if using wallet)
    if (paymentMethod === 'wallet') {
      const user = await User.findById(userId);
      if (user.walletBalance < investmentAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
    }

    // Create investment record
    const investment = new Investment({
      investor: userId,
      project: projectId,
      tokensInvested,
      investmentAmount,
      pricePerToken: project.tokenPrice,
      paymentMethod,
      transactionId: `TXN_${Date.now()}_${userId}`,
      status: 'completed' // In real app, this would be 'pending' until payment is confirmed
    });

    await investment.save();

    // Update project funding and sold tokens
    project.soldTokens += tokensInvested;
    project.currentFunding += investmentAmount;
    project.availableTokens = project.totalTokens - project.soldTokens;

    // Check if project is fully funded
    if (project.currentFunding >= project.fundingGoal) {
      project.status = 'funded';
    }

    await project.save();

    // Update user's investment tracking
    const user = await User.findById(userId);
    user.totalInvestments += investmentAmount;
    
    // Deduct from wallet if using wallet payment
    if (paymentMethod === 'wallet') {
      user.walletBalance -= investmentAmount;
    }
    
    await user.save();

    // Populate investment for response
    const populatedInvestment = await Investment.findById(investment._id)
      .populate('project', 'title tokenPrice category')
      .populate('investor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: { investment: populatedInvestment }
    });

  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during investment creation'
    });
  }
};

// Get User Investments
const getUserInvestments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { investor: req.user._id };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const investments = await Investment.find(filter)
      .populate('project', 'title tokenPrice category status currentFunding fundingGoal')
      .sort({ investmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Investment.countDocuments(filter);

    // Calculate total investment stats
    const investmentStats = await Investment.aggregate([
      { $match: { investor: req.user._id } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$investmentAmount' },
          totalTokens: { $sum: '$tokensInvested' },
          totalDividends: { $sum: '$dividendsReceived' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        investments,
        stats: investmentStats[0] || {
          totalInvested: 0,
          totalTokens: 0,
          totalDividends: 0
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalInvestments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Single Investment Details
const getInvestmentDetails = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      investor: req.user._id
    })
      .populate('project', 'title description tokenPrice category status currentFunding fundingGoal images')
      .populate('investor', 'name email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { investment }
    });

  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Investment Dashboard Stats
const getInvestmentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total investments
    const totalInvestments = await Investment.countDocuments({ investor: userId });

    // Investment value stats
    const valueStats = await Investment.aggregate([
      { $match: { investor: userId } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$investmentAmount' },
          totalDividends: { $sum: '$dividendsReceived' },
          totalROI: { $sum: '$returnOnInvestment' }
        }
      }
    ]);

    // Recent investments
    const recentInvestments = await Investment.find({ investor: userId })
      .populate('project', 'title category tokenPrice')
      .sort({ investmentDate: -1 })
      .limit(5);

    // Investment by category
    const categoryBreakdown = await Investment.aggregate([
      { $match: { investor: userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectData'
        }
      },
      { $unwind: '$projectData' },
      {
        $group: {
          _id: '$projectData.category',
          totalInvested: { $sum: '$investmentAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = valueStats[0] || {
      totalInvested: 0,
      totalDividends: 0,
      totalROI: 0
    };

    res.status(200).json({
      success: true,
      data: {
        totalInvestments,
        stats,
        recentInvestments,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Get investment dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createInvestment,
  getUserInvestments,
  getInvestmentDetails,
  getInvestmentDashboard
};