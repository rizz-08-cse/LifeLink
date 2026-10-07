/**
 * Medical Blood Compatibility Matrix (Biological ABO / Rh System)
 */

const RECIPIENT_CAN_RECEIVE_FROM = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

const DONOR_CAN_GIVE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Returns list of compatible donor blood groups for a given recipient blood group
 * @param {string} recipientBloodGroup
 * @returns {string[]}
 */
const getCompatibleDonorsForRecipient = (recipientBloodGroup) => {
  return RECIPIENT_CAN_RECEIVE_FROM[recipientBloodGroup] || [recipientBloodGroup];
};

/**
 * Checks if a donor blood group is compatible with a recipient
 * @param {string} donorGroup
 * @param {string} recipientGroup
 * @returns {boolean}
 */
const isBloodCompatible = (donorGroup, recipientGroup) => {
  const allowed = RECIPIENT_CAN_RECEIVE_FROM[recipientGroup] || [];
  return allowed.includes(donorGroup);
};

module.exports = {
  ALL_BLOOD_GROUPS,
  RECIPIENT_CAN_RECEIVE_FROM,
  DONOR_CAN_GIVE_TO,
  getCompatibleDonorsForRecipient,
  isBloodCompatible
};
