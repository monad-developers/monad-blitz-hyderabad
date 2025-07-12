const express = require('express');
const { body } = require('express-validator');
const {
  createInvestment,
  getUserInvestments,
  getInvestmentDetails,
  getInvestmentDashboard
} = require('../../controllers/user/investmentController');
const verifyUser = require('../../middleware/verifyUser');

const router = express.Router();

// Apply user middleware to all routes
router.use(verifyUser);

// Validation rules
const investmentValidation = [
  body('projectId')
    .isMongoId()
    .withMessage('Please provide a valid project ID'),
  body('tokensInvested')
    .isInt({ min: 1 })
    .withMessage('Must invest at least 1 token'),
  body('paymentMethod')
    .isIn(['credit_card', 'bank_transfer', 'crypto', 'wallet'])
    .withMessage('Invalid payment method')
];

// Routes
// POST /api/user/investment
router.post('/', investmentValidation, createInvestment);

// GET /api/user/investment
router.get('/', getUserInvestments);

// GET /api/user/investment/dashboard
router.get('/dashboard', getInvestmentDashboard);

// GET /api/user/investment/:id
router.get('/:id', getInvestmentDetails);

module.exports = router;