const DonorProfile = require('../models/DonorProfile');
const DonationHistory = require('../models/DonationHistory');
const { getCompatibleDonorsForRecipient } = require('../utils/bloodCompatibility');
const { sanitizeDonorForPublic } = require('../utils/privacyFilter');

// @desc    Toggle donor availability status
// @route   PUT /api/donors/availability
// @access  Private (Donor only)
const toggleAvailability = async (req, res, next) => {
  try {
    let profile = await DonorProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found for this user.'
      });
    }

    profile.isAvailable = !profile.isAvailable;
    await profile.save();

    res.json({
      success: true,
      isAvailable: profile.isAvailable,
      message: `You are now marked as ${profile.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} for blood donation calls.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Geospatial search for nearby compatible donors using $geoNear
// @route   GET /api/donors/nearby
// @access  Public / Authenticated
const searchNearbyDonors = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      bloodGroup,
      maxDistanceKm = 25,
      onlyAvailable = 'true'
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'User coordinates (latitude & longitude) are required for proximity discovery.'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = Math.min(parseFloat(maxDistanceKm) * 1000, 100000); // capped at 100 km

    // Build aggregation pipeline using MongoDB $geoNear
    const matchConditions = {};

    // Filter by availability
    if (onlyAvailable === 'true') {
      matchConditions.isAvailable = true;
    }

    // Filter by biological blood compatibility if recipient group specified
    if (bloodGroup) {
      const compatibleGroups = getCompatibleDonorsForRecipient(bloodGroup.toUpperCase());
      matchConditions.bloodGroup = { $in: compatibleGroups };
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: matchConditions
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $limit: 50
      }
    ];

    const results = await DonorProfile.aggregate(pipeline);

    // Apply strict healthcare privacy filter: strip exact GPS coordinates and private phone numbers
    const safeDonors = results.map((item) => {
      const donorDoc = {
        _id: item._id,
        bloodGroup: item.bloodGroup,
        isAvailable: item.isAvailable,
        addressLocality: item.addressLocality,
        totalDonations: item.totalDonations,
        user: {
          _id: item.userDetails._id,
          fullName: item.userDetails.fullName,
          isVerified: item.userDetails.isVerified
        }
      };
      return sanitizeDonorForPublic(donorDoc, item.distanceMeters);
    });

    res.json({
      success: true,
      count: safeDonors.length,
      requestedBloodGroup: bloodGroup || null,
      maxDistanceKm: radiusMeters / 1000,
      donors: safeDonors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor profile directory (filtered by blood group, safe public view)
// @route   GET /api/donors
// @access  Public
const getDonorsDirectory = async (req, res, next) => {
  try {
    const { bloodGroup, isAvailable } = req.query;
    const filter = {};

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup.toUpperCase();
    }
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const profiles = await DonorProfile.find(filter)
      .populate('user', 'fullName isVerified')
      .limit(30)
      .sort({ updatedAt: -1 });

    const safeDonors = profiles.map((p) => sanitizeDonorForPublic(p));

    res.json({
      success: true,
      count: safeDonors.length,
      donors: safeDonors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in donor's donation history
// @route   GET /api/donors/history
// @access  Private (Donor)
const getMyDonationHistory = async (req, res, next) => {
  try {
    const history = await DonationHistory.find({ donorUser: req.user._id })
      .populate('request', 'hospitalName hospitalAddress urgency status')
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleAvailability,
  searchNearbyDonors,
  getDonorsDirectory,
  getMyDonationHistory
};
