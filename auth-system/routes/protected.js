const express = require('express');
const authenticate = require('../middleware/authenticate');
const userService = require('../services/userService');

const router = express.Router();

/**
 * @route   GET /protected/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        // req.user is attached by authenticate middleware
        const user = await userService.findByEmail(req.user.email);
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * @route   GET /protected/dashboard
 * @desc    Get dashboard welcome message
 * @access  Protected
 */
router.get('/dashboard', authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to dashboard",
        user: {
            email: req.user.email
        }
    });
});

module.exports = router;
