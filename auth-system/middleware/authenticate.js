const tokenService = require('../services/tokenService');

/**
 * Middleware to authenticate requests using FlashDB backed tokens
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer TOKEN'

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication token required" 
            });
        }

        // 1. Check if token is blacklisted in FlashDB
        const isBlacklisted = await tokenService.isBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({ 
                success: false, 
                error: "Token has been revoked" 
            });
        }

        // 2. Verify token exists in FlashDB and is valid JWT
        const decoded = await tokenService.verifyAccess(token);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                error: "Invalid or expired session" 
            });
        }

        // 3. Attach user payload to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: "Internal server error during authentication" 
        });
    }
};

module.exports = authenticate;
