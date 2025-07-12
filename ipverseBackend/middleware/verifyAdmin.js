const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is an admin
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin account is inactive.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid admin token.'
    });
  }
};

module.exports = verifyAdmin;