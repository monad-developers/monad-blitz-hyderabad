const express = require('express');
const { body } = require('express-validator');
const {
  loginAdmin,
  getAdminProfile,
  createAdmin,
  logoutAdmin,
  updateAdminProfile
} = require('../../controllers/admin/authController');
const verifyAdmin = require('../../middleware/verifyAdmin');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const createAdminValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin'])
    .withMessage('Invalid role specified')
];

// Routes
// POST /api/admin/auth/login
router.post('/login', loginValidation, loginAdmin);

// GET /api/admin/auth/profile
router.get('/profile', verifyAdmin, getAdminProfile);

// POST /api/admin/auth/create
router.post('/create', verifyAdmin, createAdminValidation, createAdmin);

// POST /api/admin/auth/logout
router.post('/logout', verifyAdmin, logoutAdmin);

// PUT /api/admin/auth/profile
router.put('/profile', verifyAdmin, updateAdminProfile);

module.exports = router;