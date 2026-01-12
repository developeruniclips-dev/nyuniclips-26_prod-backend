const { Router } = require('express');
const { getPlatformStats } = require('../controller/statsController');

const router = Router();

// Public endpoint - no auth required
router.get('/', getPlatformStats);

module.exports = router;
