const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const DonationHistory = require('../models/DonationHistory');

// @desc    Get comprehensive system analytics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      donationsAggregate,
      bloodGroupCounts
    ] = await Promise.all([
      User.countDocuments(),
      DonorProfile.countDocuments(),
      DonorProfile.countDocuments({ isAvailable: true }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'PENDING' }),
      BloodRequest.countDocuments({ status: 'FULFILLED' }),
      DonationHistory.aggregate([
        { $group: { _id: null, totalUnits: { $sum: '$unitsDonated' }, count: { $sum: 1 } } }
      ]),
      DonorProfile.aggregate([
        { $group: { _id: '$bloodGroup', count: { $sum: 1 }, available: { $sum: { $cond: ['$isAvailable', 1, 0] } } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const recentRequests = await BloodRequest.find()
      .populate('requester', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentDonations = await DonationHistory.find()
      .populate('donorUser', 'fullName email')
      .sort({ completedAt: -1 })
      .limit(10);

    const totalUnitsDonated = donationsAggregate[0]?.totalUnits || 0;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          availableDonors
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          fulfilled: fulfilledRequests,
          fulfillmentRate: totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0
        },
        bloodGroupDistribution: bloodGroupCounts,
        totalUnitsDonated,
        recentRequests,
        recentDonations
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or toggle verification of a user
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.fullName} verification status changed to ${user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`,
      isVerified: user.isVerified
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  toggleUserVerification
};
