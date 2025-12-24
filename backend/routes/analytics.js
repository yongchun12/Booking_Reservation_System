const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');

// Get Admin Dashboard Stats
router.get('/admin/stats', auth, isAdmin, async (req, res) => {
    try {
        // Parallelize queries for performance
        const [
            [totalBookings],
            [activeResources],
            [totalUsers],
            [recentActivity]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM bookings'),
            db.query('SELECT COUNT(*) as count FROM resources'),
            db.query('SELECT COUNT(*) as count FROM users'),
            db.query(`
                SELECT b.id, u.name as user, r.name as resource, b.created_at 
                FROM bookings b 
                JOIN users u ON b.user_id = u.id 
                JOIN resources r ON b.resource_id = r.id 
                ORDER BY b.created_at DESC LIMIT 5
            `)
        ]);

        // Mock data for charts (since we might not have historical data yet)
        const bookingTrends = [
            { name: 'Jan', bookings: 12 },
            { name: 'Feb', bookings: 19 },
            { name: 'Mar', bookings: 3 },
            { name: 'Apr', bookings: 5 },
            { name: 'May', bookings: 2 },
            { name: 'Jun', bookings: 3 },
        ];

        res.json({
            stats: {
                totalBookings: totalBookings[0].count,
                activeResources: activeResources[0].count,
                totalUsers: totalUsers[0].count
            },
            recentActivity: recentActivity,
            trends: bookingTrends
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// Get User Dashboard Stats
router.get('/user/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            [myTotalBookings],
            [upcomingBookings]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM bookings WHERE user_id = ?', [userId]),
            db.query(`
                SELECT b.*, r.name as resource_name 
                FROM bookings b 
                JOIN resources r ON b.resource_id = r.id 
                WHERE b.user_id = ? AND b.start_time > NOW() 
                ORDER BY b.start_time ASC LIMIT 3
            `, [userId])
        ]);

        res.json({
            totalBookings: myTotalBookings[0].count,
            upcoming: upcomingBookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching user stats' });
    }
});

module.exports = router;
