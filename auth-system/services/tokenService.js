const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const FLASHDB_URL = process.env.FLASHDB_URL || 'http://localhost:3001';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Service to handle JWT generation, verification and Storage in FlashDB
 */
class TokenService {
    /**
     * Generate Access and Refresh JWTs
     * @param {Object} user User payload
     * @returns {Object} { accessToken, refreshToken }
     */
    generateTokens(user) {
        const payload = { userId: user.id, email: user.email };
        
        const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }

    /**
     * Store tokens in FlashDB REST API
     * @param {Object} tokens { accessToken, refreshToken }
     * @param {Object} user User payload
     */
    async storeTokens(tokens, user) {
        await this.storeAccessToken(tokens.accessToken, user);
        await this.storeRefreshToken(tokens.refreshToken, user);
    }

    /**
     * Store access token in FlashDB
     */
    async storeAccessToken(token, user) {
        const payload = { userId: user.id, email: user.email };
        await axios.post(`${FLASHDB_URL}/api/set`, {
            key: `access:${token}`,
            value: payload,
            ttl: 900
        });
    }

    /**
     * Store refresh token in FlashDB
     */
    async storeRefreshToken(token, user) {
        const payload = { userId: user.id, email: user.email };
        await axios.post(`${FLASHDB_URL}/api/set`, {
            key: `refresh:${token}`,
            value: payload,
            ttl: 604800
        });
    }

    /**
     * Verify access token against FlashDB
     * @param {string} token 
     * @returns {Promise<Object|null>} Payload or null
     */
    async verifyAccess(token) {
        try {
            // Check if token exists in FlashDB
            const response = await axios.get(`${FLASHDB_URL}/api/get/access:${token}`);
            if (response.data.success && response.data.data) {
                // Also verify JWT signature
                return jwt.verify(token, ACCESS_SECRET);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verify refresh token against FlashDB
     * @param {string} token 
     * @returns {Promise<Object|null>} Payload or null
     */
    async verifyRefresh(token) {
        try {
            const response = await axios.get(`${FLASHDB_URL}/api/get/refresh:${token}`);
            if (response.data.success && response.data.data) {
                return jwt.verify(token, REFRESH_SECRET);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Blacklist a token (logout)
     * @param {string} token 
     */
    async blacklistToken(token) {
        await axios.post(`${FLASHDB_URL}/api/set`, {
            key: `blacklist:${token}`,
            value: true,
            ttl: 604800 // 7 days
        });
    }

    /**
     * Check if a token is blacklisted
     * @param {string} token 
     * @returns {Promise<boolean>}
     */
    async isBlacklisted(token) {
        try {
            const response = await axios.get(`${FLASHDB_URL}/api/get/blacklist:${token}`);
            return !!(response.data.success && response.data.data);
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete tokens from FlashDB
     * @param {string} access 
     * @param {string} refresh 
     */
    async deleteTokens(access, refresh) {
        if (access) {
            await axios.delete(`${FLASHDB_URL}/api/delete/access:${access}`);
        }
        if (refresh) {
            await axios.delete(`${FLASHDB_URL}/api/delete/refresh:${refresh}`);
        }
    }
}

module.exports = new TokenService();
