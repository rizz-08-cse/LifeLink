const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  fulfillRequest,
  cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createRequest)
  .get(getRequests);

router.route('/:id')
  .get(getRequestById);

router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/fulfill', protect, fulfillRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
