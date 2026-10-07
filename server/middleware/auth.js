const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lifelink_production_jwt_secret_key_blood_donation_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The account associated with this token no longer exists.'
        });
      }

      req.user = user;

      // Attach donor profile if user is a donor
      if (user.role === 'donor') {
        const profile = await DonorProfile.findOne({ user: user._id });
        if (profile) {
          req.donorProfile = profile;
        }
      }

      next();
    } catch (error) {
      console.error('[Auth Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }
};

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
