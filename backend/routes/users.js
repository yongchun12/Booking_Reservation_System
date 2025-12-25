const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (for search/dropdowns)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Return only necessary info, maybe exclude current user
        const [users] = await db.query('SELECT id, name, email FROM users WHERE id != ? ORDER BY name ASC', [req.user.id]);
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
