const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Auth System API is running",
        version: "1.0.0"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Something went wrong on the server"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Auth System running on port ${PORT}`);
    console.log(`FlashDB expected at ${process.env.FLASHDB_URL}`);
    console.log(`=========================================`);
});
