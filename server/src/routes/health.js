const express = require('express');
const router = express.Router();

// @desc    Check server health
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
