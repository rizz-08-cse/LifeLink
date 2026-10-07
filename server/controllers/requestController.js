const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const DonationHistory = require('../models/DonationHistory');
const { getIO } = require('../config/socket');
const { getCompatibleDonorsForRecipient } = require('../utils/bloodCompatibility');
const { sanitizeDonorForMatchedRequester } = require('../utils/privacyFilter');

// @desc    Create a new emergency or standard blood request
// @route   POST /api/requests
// @access  Private (Requester / Donor / Admin)
const createRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded = 1,
      hospitalName,
      hospitalAddress,
      latitude,
      longitude,
      urgency = 'URGENT',
      contactPhone,
      notes = ''
    } = req.body;

    if (!patientName || !bloodGroup || !hospitalName || !hospitalAddress || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory medical request details.'
      });
    }

    const lat = parseFloat(latitude) || 0;
    const lng = parseFloat(longitude) || 0;

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      patientName,
      bloodGroup: bloodGroup.toUpperCase(),
      unitsNeeded: Number(unitsNeeded),
      hospitalName,
      hospitalAddress,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      urgency,
      contactPhone,
      notes,
      status: 'PENDING'
    });

    // Determine biologically compatible donor blood types
    const compatibleGroups = getCompatibleDonorsForRecipient(bloodGroup.toUpperCase());

    // Count compatible donors in vicinity (within 50km if coordinates provided)
    let nearbyMatchesCount = 0;
    if (lat !== 0 || lng !== 0) {
      try {
        nearbyMatchesCount = await DonorProfile.countDocuments({
          isAvailable: true,
          bloodGroup: { $in: compatibleGroups },
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: 50000 // 50 km
            }
          }
        });
      } catch (err) {
        console.warn('[Geospatial Count Warning]:', err.message);
      }
    }

    // Real-Time Socket.IO Broadcast: Dispatch to compatible blood groups & global emergency feed
    const io = getIO();
    if (io) {
      const alertPayload = {
        _id: bloodRequest._id,
        patientName: bloodRequest.patientName,
        bloodGroup: bloodRequest.bloodGroup,
        unitsNeeded: bloodRequest.unitsNeeded,
        hospitalName: bloodRequest.hospitalName,
        hospitalAddress: bloodRequest.hospitalAddress,
        urgency: bloodRequest.urgency,
        createdAt: bloodRequest.createdAt,
        compatibleGroups,
        nearbyMatchesCount
      };

      // Emit to each compatible blood group's room
      compatibleGroups.forEach((group) => {
        io.to(`blood_${group}`).emit('emergency_blood_alert', alertPayload);
      });

      // Also emit to general emergency channel
      io.emit('new_blood_request_feed', alertPayload);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency blood request created and dispatched to nearby donors.',
      request: bloodRequest,
      compatibleGroups,
      potentialMatchesCount: nearbyMatchesCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active/filtered blood requests
// @route   GET /api/requests
// @access  Public / Authenticated
const getRequests = async (req, res, next) => {
  try {
    const { bloodGroup, urgency, status = 'PENDING', mineOnly } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (urgency) {
      filter.urgency = urgency.toUpperCase();
    }
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup.toUpperCase();
    }
    if (mineOnly === 'true' && req.user) {
      filter.requester = req.user._id;
    }

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'fullName email phone')
      .populate({
        path: 'acceptedByDonor',
        populate: { path: 'user', select: 'fullName phone email' }
      })
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blood request details
// @route   GET /api/requests/:id
// @access  Public / Authenticated
const getRequestById = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requester', 'fullName phone email')
      .populate({
        path: 'acceptedByDonor',
        populate: { path: 'user', select: 'fullName phone email' }
      });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    const compatibleGroups = getCompatibleDonorsForRecipient(bloodRequest.bloodGroup);

    res.json({
      success: true,
      request: bloodRequest,
      compatibleGroups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor accepts / responds to a blood request
// @route   PUT /api/requests/:id/accept
// @access  Private (Donor only)
const acceptRequest = async (req, res, next) => {
  try {
    const donorProfile = await DonorProfile.findOne({ user: req.user._id });
    if (!donorProfile) {
      return res.status(400).json({
        success: false,
        message: 'You must have an active donor profile to accept blood requests.'
      });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    if (bloodRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${bloodRequest.status}.`
      });
    }

    // Verify biological compatibility
    const compatibleGroups = getCompatibleDonorsForRecipient(bloodRequest.bloodGroup);
    if (!compatibleGroups.includes(donorProfile.bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Your blood group (${donorProfile.bloodGroup}) is medically incompatible with recipient requirement (${bloodRequest.bloodGroup}).`
      });
    }

    bloodRequest.status = 'ACCEPTED';
    bloodRequest.acceptedByDonor = donorProfile._id;
    bloodRequest.acceptedAt = new Date();
    await bloodRequest.save();

    // Populate for response and real-time emission
    await bloodRequest.populate('requester', 'fullName phone email');
    await bloodRequest.populate({
      path: 'acceptedByDonor',
      populate: { path: 'user', select: 'fullName phone email' }
    });

    const donorCoordinationInfo = sanitizeDonorForMatchedRequester(donorProfile, bloodRequest);

    // Socket.IO real-time notification to requester and room
    const io = getIO();
    if (io) {
      // Notify the requester directly
      io.to(`user_${bloodRequest.requester._id}`).emit('donor_accepted_request', {
        requestId: bloodRequest._id,
        patientName: bloodRequest.patientName,
        donor: donorCoordinationInfo,
        message: `Great news! Donor ${req.user.fullName} (${donorProfile.bloodGroup}) has accepted your request.`
      });

      // Broadcast update to anyone viewing this request
      io.to(`request_${bloodRequest._id}`).emit('request_status_updated', {
        requestId: bloodRequest._id,
        status: 'ACCEPTED',
        acceptedByDonor: donorCoordinationInfo
      });

      // Global feed update
      io.emit('request_status_change', {
        requestId: bloodRequest._id,
        status: 'ACCEPTED'
      });
    }

    res.json({
      success: true,
      message: 'You have successfully accepted this request. Contact details unlocked.',
      request: bloodRequest,
      coordinationContact: {
        requesterName: bloodRequest.requester.fullName,
        contactPhone: bloodRequest.contactPhone || bloodRequest.requester.phone,
        hospitalName: bloodRequest.hospitalName,
        hospitalAddress: bloodRequest.hospitalAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark request as fulfilled (donation completed)
// @route   PUT /api/requests/:id/fulfill
// @access  Private (Requester or Admin)
const fulfillRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id).populate('acceptedByDonor');
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    // Verify ownership or admin
    if (
      bloodRequest.requester.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester or an administrator can mark this request as fulfilled.'
      });
    }

    bloodRequest.status = 'FULFILLED';
    bloodRequest.fulfilledAt = new Date();
    await bloodRequest.save();

    // If accepted by a registered donor, update their stats and log DonationHistory
    if (bloodRequest.acceptedByDonor) {
      const donorProfile = await DonorProfile.findById(bloodRequest.acceptedByDonor._id);
      if (donorProfile) {
        donorProfile.totalDonations = (donorProfile.totalDonations || 0) + bloodRequest.unitsNeeded;
        donorProfile.lastDonationDate = new Date();
        await donorProfile.save();

        // Create official donation history log
        await DonationHistory.create({
          donor: donorProfile._id,
          donorUser: donorProfile.user,
          request: bloodRequest._id,
          patientName: bloodRequest.patientName,
          bloodGroup: bloodRequest.bloodGroup,
          unitsDonated: bloodRequest.unitsNeeded,
          hospitalName: bloodRequest.hospitalName,
          notes: `Fulfilled emergency request for ${bloodRequest.patientName}`
        });

        // Notify donor via Socket.IO
        const io = getIO();
        if (io) {
          io.to(`user_${donorProfile.user}`).emit('donation_completed_celebration', {
            requestId: bloodRequest._id,
            patientName: bloodRequest.patientName,
            units: bloodRequest.unitsNeeded,
            message: `Thank you! Your blood donation for ${bloodRequest.patientName} has been officially recorded.`
          });
        }
      }
    }

    const io = getIO();
    if (io) {
      io.to(`request_${bloodRequest._id}`).emit('request_status_updated', {
        requestId: bloodRequest._id,
        status: 'FULFILLED'
      });
      io.emit('request_status_change', {
        requestId: bloodRequest._id,
        status: 'FULFILLED'
      });
    }

    res.json({
      success: true,
      message: 'Request marked as successfully fulfilled. Donor history credited.',
      request: bloodRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request
// @route   PUT /api/requests/:id/cancel
// @access  Private (Requester or Admin)
const cancelRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    if (
      bloodRequest.requester.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request.'
      });
    }

    bloodRequest.status = 'CANCELLED';
    await bloodRequest.save();

    const io = getIO();
    if (io) {
      io.to(`request_${bloodRequest._id}`).emit('request_status_updated', {
        requestId: bloodRequest._id,
        status: 'CANCELLED'
      });
    }

    res.json({
      success: true,
      message: 'Request successfully cancelled.',
      request: bloodRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  fulfillRequest,
  cancelRequest
};
