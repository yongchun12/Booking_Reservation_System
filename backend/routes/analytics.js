const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get Admin Dashboard Stats
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
    try {
        // Parallelize queries for performance
        // Parallelize queries for performance
        const [
            [totalBookings],
            [activeResources],
            [totalUsers],
            [recentActivity],
            bookingTrends,
            resourceUtilization
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
            `),
            // Booking Trends (Last 6 months)
            db.query(`
                SELECT DATE_FORMAT(booking_date, '%b') as name, COUNT(*) as bookings 
                FROM bookings 
                WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
                GROUP BY DATE_FORMAT(booking_date, '%Y-%m'), name 
                ORDER BY DATE_FORMAT(booking_date, '%Y-%m') ASC
            `).then(([rows]) => rows),
            // Resource Utilization by Type
            db.query(`
                SELECT r.type as name, COUNT(b.id) as value 
                FROM resources r 
                LEFT JOIN bookings b ON r.id = b.resource_id 
                GROUP BY r.type
            `).then(([rows]) => rows)
        ]);

        res.json({
            stats: {
                totalBookings: totalBookings[0].count,
                activeResources: activeResources[0].count,
                totalUsers: totalUsers[0].count
            },
            recentActivity: recentActivity[0] ? recentActivity : [], // Handle varying return shapes if needed, usually [rows] is first
            trends: bookingTrends,
            utilization: resourceUtilization
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
            [totalBookings],
            [upcomingCount],
            [completedCount],
            [recentActivity]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM bookings WHERE user_id = ?', [userId]),
            db.query('SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND booking_date >= CURDATE() AND status != "cancelled"', [userId]), // Simplified future check
            db.query('SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND booking_date < CURDATE() AND status = "completed"', [userId]),
            db.query(`
                SELECT b.id, b.booking_date, b.start_time, b.status, r.name as resource_name 
                FROM bookings b 
                JOIN resources r ON b.resource_id = r.id 
                WHERE b.user_id = ? 
                ORDER BY b.booking_date DESC, b.start_time DESC LIMIT 5
            `, [userId])
        ]);

        // Real monthly data aggregation (Last 6 months)
        const [monthlyRows] = await db.query(`
            SELECT DATE_FORMAT(booking_date, '%b') as name, COUNT(*) as bookings 
            FROM bookings 
            WHERE user_id = ? 
            AND booking_date >= DATE_SUB(NOW(), INTERVAL 5 MONTH) 
            GROUP BY DATE_FORMAT(booking_date, '%Y-%m'), name 
            ORDER BY DATE_FORMAT(booking_date, '%Y-%m') ASC
        `, [userId]);

        // Ensure all last 6 months are present, even if zero
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
        }

        const monthlyData = months.map(m => {
            const found = monthlyRows.find(r => r.name === m);
            return { name: m, bookings: found ? found.bookings : 0 };
        });

        res.json({
            totalBookings: totalBookings[0].count,
            upcoming: upcomingCount[0].count,
            completed: completedCount[0].count,
            recentActivity: recentActivity,
            monthlyData: monthlyData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching user stats' });
    }
});

module.exports = router;
