const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// Get current stats (public endpoint)
router.get('/', statsController.getStats);

// Update stats (admin only)
router.put('/', verifyToken, isAdmin, statsController.updateStats);

module.exports = router; 