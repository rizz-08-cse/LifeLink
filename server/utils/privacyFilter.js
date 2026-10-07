/**
 * Healthcare Donor Privacy Filter
 * Enforces privacy rules so exact GPS coordinates and contact numbers are
 * NOT exposed on public listings or unverified search feeds.
 */

/**
 * Strips exact coordinates and raw private contact info from a donor document.
 * Returns safe public information: blood group, availability, approximate distance, locality.
 *
 * @param {Object} donor - Mongoose document or plain object
 * @param {number} [calculatedDistanceMeters] - Distance calculated via $geoNear or Haversine
 * @returns {Object} Safe public donor projection
 */
const sanitizeDonorForPublic = (donor, calculatedDistanceMeters = null) => {
  if (!donor) return null;

  const raw = donor.toObject ? donor.toObject() : donor;
  const user = raw.user || {};

  let distanceKm = null;
  let distanceDisplay = 'In your area';

  if (calculatedDistanceMeters !== null && !isNaN(calculatedDistanceMeters)) {
    distanceKm = Math.round((calculatedDistanceMeters / 1000) * 10) / 10;
    if (distanceKm < 1) {
      distanceDisplay = 'Under 1 km away';
    } else {
      distanceDisplay = `~${distanceKm} km away`;
    }
  } else if (raw.distanceKm !== undefined) {
    distanceKm = Math.round(raw.distanceKm * 10) / 10;
    distanceDisplay = `~${distanceKm} km away`;
  }

  return {
    _id: raw._id,
    donorId: raw._id,
    userId: user._id || raw.userId,
    donorName: user.fullName ? `${user.fullName.split(' ')[0]} ${user.fullName.split(' ')[1] ? user.fullName.split(' ')[1][0] + '.' : ''}` : 'Verified Donor',
    bloodGroup: raw.bloodGroup,
    isAvailable: raw.isAvailable,
    locality: raw.addressLocality || 'Registered Area',
    distanceKm,
    distanceDisplay,
    totalDonations: raw.totalDonations || 0,
    lastDonationDate: raw.lastDonationDate || null,
    isVerified: user.isVerified || false,
    // Exact GPS coordinates are deliberately excluded!
  };
};

/**
 * Returns full contact and coordination details once a blood request has been mutually accepted.
 */
const sanitizeDonorForMatchedRequester = (donor, request) => {
  if (!donor) return null;
  const raw = donor.toObject ? donor.toObject() : donor;
  const user = raw.user || {};

  return {
    _id: raw._id,
    userId: user._id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    bloodGroup: raw.bloodGroup,
    locality: raw.addressLocality,
    totalDonations: raw.totalDonations,
    status: 'CONNECTED',
    acceptedAt: request?.updatedAt || new Date()
  };
};

module.exports = {
  sanitizeDonorForPublic,
  sanitizeDonorForMatchedRequester
};
