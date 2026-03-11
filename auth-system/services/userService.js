const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Service to handle user-related data operations
 */
class UserService {
    /**
     * Get all users from the JSON file
     * @returns {Promise<Array>} List of users
     */
    async getAllUsers() {
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, return empty array
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    /**
     * Find a user by email
     * @param {string} email 
     * @returns {Promise<Object|null>} User object or null
     */
    async findByEmail(email) {
        const users = await this.getAllUsers();
        return users.find(user => user.email === email) || null;
    }

    /**
     * Create a new user
     * @param {Object} userData { username, email, password }
     * @returns {Promise<Object>} Created user
     */
    async createUser(userData) {
        const users = await this.getAllUsers();
        const newUser = {
            id: uuidv4(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return newUser;
    }
}

module.exports = new UserService();
