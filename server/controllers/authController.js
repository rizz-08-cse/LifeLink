const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'lifelink_production_jwt_secret_key_blood_donation_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// @desc    Register a new user (donor or requester)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role = 'donor',
      bloodGroup,
      latitude,
      longitude,
      addressLocality
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Role validation
    const validRoles = ['donor', 'requester', 'admin'];
    const chosenRole = validRoles.includes(role) ? role : 'donor';

    // Create user record
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: chosenRole
    });

    let donorProfile = null;

    // If registering as a donor, create their donor profile with geospatial location
    if (chosenRole === 'donor') {
      if (!bloodGroup) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Blood group is required when registering as a blood donor.'
        });
      }

      // Default coords if browser location not yet granted or provided
      const lng = parseFloat(longitude) || 0;
      const lat = parseFloat(latitude) || 0;

      donorProfile = await DonorProfile.create({
        user: user._id,
        bloodGroup,
        isAvailable: true,
        addressLocality: addressLocality || 'My Area',
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      donorProfile: donorProfile
        ? {
            _id: donorProfile._id,
            bloodGroup: donorProfile.bloodGroup,
            isAvailable: donorProfile.isAvailable,
            addressLocality: donorProfile.addressLocality,
            totalDonations: donorProfile.totalDonations,
            hasCoordinates: donorProfile.location.coordinates[0] !== 0 || donorProfile.location.coordinates[1] !== 0
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      donorProfile: donorProfile
        ? {
            _id: donorProfile._id,
            bloodGroup: donorProfile.bloodGroup,
            isAvailable: donorProfile.isAvailable,
            addressLocality: donorProfile.addressLocality,
            totalDonations: donorProfile.totalDonations,
            hasCoordinates: donorProfile.location.coordinates[0] !== 0 || donorProfile.location.coordinates[1] !== 0
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let donorProfile = null;

    if (user.role === 'donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      donorProfile: donorProfile
        ? {
            _id: donorProfile._id,
            bloodGroup: donorProfile.bloodGroup,
            isAvailable: donorProfile.isAvailable,
            addressLocality: donorProfile.addressLocality,
            totalDonations: donorProfile.totalDonations,
            hasCoordinates: donorProfile.location.coordinates[0] !== 0 || donorProfile.location.coordinates[1] !== 0
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user geolocation (from browser GPS)
// @route   POST /api/auth/location
// @access  Private
const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, addressLocality } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are out of standard geographic bounds'
      });
    }

    if (req.user.role === 'donor') {
      const profile = await DonorProfile.findOne({ user: req.user._id });
      if (profile) {
        profile.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        if (addressLocality) {
          profile.addressLocality = addressLocality;
        }
        await profile.save();
      }
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      locality: addressLocality || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateLocation
};
