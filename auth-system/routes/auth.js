const express = require('express');
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validate fields
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Please provide username, email and password" 
            });
        }

        // 2. Check if user already exists
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: "Email already registered" 
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Save user
        await userService.createUser({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ 
            success: true, 
            message: "User created" 
        });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * @route   POST /auth/login
 * @desc    Authenticate user & get tokens
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Please provide email and password" 
            });
        }

        // 1. Find user
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid credentials" 
            });
        }

        // 3. Generate tokens
        const tokens = tokenService.generateTokens(user);

        // 4. Store tokens in FlashDB
        await tokenService.storeTokens(tokens, user);

        res.json({ 
            success: true, 
            accessToken: tokens.accessToken, 
            refreshToken: tokens.refreshToken 
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * @route   POST /auth/refresh
 * @desc    Get new access token using refresh token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ 
                success: false, 
                error: "Refresh token is required" 
            });
        }

        // 1. Verify refresh token in FlashDB
        const decoded = await tokenService.verifyRefresh(refreshToken);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid or expired refresh token" 
            });
        }

        // 2. Check if blacklisted
        const isBlacklisted = await tokenService.isBlacklisted(refreshToken);
        if (isBlacklisted) {
            return res.status(401).json({ 
                success: false, 
                error: "Token has been revoked" 
            });
        }

        // 3. Generate new tokens (or just access token as per requirement)
        const user = { id: decoded.userId, email: decoded.email };
        const tokens = tokenService.generateTokens(user);

        // 4. Store new access token in FlashDB
        await tokenService.storeAccessToken(tokens.accessToken, user);

        res.json({ 
            success: true, 
            accessToken: tokens.accessToken 
        });
    } catch (error) {
        console.error('Refresh Error:', error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * @route   POST /auth/logout
 * @desc    Blacklist and delete tokens
 */
router.post('/logout', async (req, res) => {
    try {
        const { accessToken, refreshToken } = req.body;

        if (!accessToken || !refreshToken) {
            return res.status(400).json({ 
                success: false, 
                error: "Both tokens are required for logout" 
            });
        }

        // Blacklist both
        await tokenService.blacklistToken(accessToken);
        await tokenService.blacklistToken(refreshToken);

        // Delete from active storage
        await tokenService.deleteTokens(accessToken, refreshToken);

        res.json({ 
            success: true, 
            message: "Logged out" 
        });
    } catch (error) {
        console.error('Logout Error:', error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
