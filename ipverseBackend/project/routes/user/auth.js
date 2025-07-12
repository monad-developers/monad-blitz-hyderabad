const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../../controllers/user/authController');
const verifyUser = require('../../middleware/verifyUser');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];

// Routes
// POST /api/user/auth/register
router.post('/register', registerValidation, registerUser);

// POST /api/user/auth/login
router.post('/login', loginValidation, loginUser);

// GET /api/user/auth/profile
router.get('/profile', verifyUser, getUserProfile);

// PUT /api/user/auth/profile
router.put('/profile', verifyUser, updateProfileValidation, updateUserProfile);

module.exports = router;