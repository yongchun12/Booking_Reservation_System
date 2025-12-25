const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to prevent caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Basic route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Booking System API is running' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const bookingRoutes = require('./routes/bookings');

const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', require('./routes/images'));
app.use('/api/categories', require('./routes/categories'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
