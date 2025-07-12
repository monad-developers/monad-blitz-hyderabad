const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectAnalytics,
  getAllCategories,
  getAllRiskLevels
} = require('../../controllers/admin/projectController');
const verifyAdmin = require('../../middleware/verifyAdmin');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyAdmin);

// Validation rules
const projectValidation = [
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Invalid company ID format'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Invalid company ID format'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['patent', 'trademark', 'copyright', 'trade_secret', 'other'])
    .withMessage('Invalid category'),
  body('ipType')
    .isIn(['utility_patent', 'design_patent', 'trademark', 'copyright', 'trade_secret'])
    .withMessage('Invalid IP type'),
  body('totalTokens')
    .isInt({ min: 1 })
    .withMessage('Total tokens must be at least 1'),
  body('tokenPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Token price must be at least $0.01'),
  body('fundingGoal')
    .isFloat({ min: 1 })
    .withMessage('Funding goal must be at least $1'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),
  body('expectedReturns')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Expected returns must be between 0 and 100'),
  body('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid risk level')
];

// Routes
// POST /api/admin/projects
router.post('/createproject',  createProject);

// GET /api/admin/projects
router.get('/allprojectlist', getAllProjects);

// GET /api/admin/projects/analytics
router.get('/analytics', getProjectAnalytics);

// GET /api/admin/projects/:id
router.get('/projectByid/:id', getProject);

// PUT /api/admin/projects/:id
router.put('/:id', projectValidation, updateProject);

// DELETE /api/admin/projects/:id
router.delete('/:id', deleteProject);

// GET /api/admin/projects/categories
router.get('/categories', getAllCategories);

// GET /api/admin/projects/risk-levels
router.get('/risk-levels', getAllRiskLevels);

module.exports = router;