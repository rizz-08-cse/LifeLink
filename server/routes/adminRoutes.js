const express = require('express');
const router = express.Router();
const { getAdminStats, toggleUserVerification } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/auth');

// All routes require authenticated Admin role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.put('/users/:id/verify', toggleUserVerification);

module.exports = router;
