const express = require('express');
const router = express.Router();
const {
  toggleAvailability,
  searchNearbyDonors,
  getDonorsDirectory,
  getMyDonationHistory
} = require('../controllers/donorController');
const { protect } = require('../middleware/auth');

router.get('/', getDonorsDirectory);
router.get('/nearby', searchNearbyDonors);
router.put('/availability', protect, toggleAvailability);
router.get('/history', protect, getMyDonationHistory);

module.exports = router;
