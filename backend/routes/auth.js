const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const { validateRegister, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        let user = await User.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create({
            name,
            email,
            password_hash,
            role
        });

        // Return JWT
        const payload = {
            user: {
                id: userId,
                role: role || 'user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const upload = require('../utils/s3Upload');

// ... (other imports)

// @route   PUT /api/auth/update-details
// @desc    Update user details
// @access  Private
router.put('/update-details', [auth, upload.single('profilePicture')], async (req, res) => {
    const { name } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pool = require('../config/database');

        // Build query efficiently
        let fields = [];
        let values = [];

        if (name) {
            fields.push('name = ?');
            values.push(name);
        }

        if (req.file) {
            fields.push('profile_picture = ?');
            values.push(req.file.location);
        }

        if (fields.length > 0) {
            values.push(req.user.id);
            const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            await pool.execute(sql, values);
        }

        res.json({
            message: 'Profile updated successfully',
            profile_picture: req.file ? req.file.location : undefined
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        // User.findById returns rows[0] based on previous file view, let's verify. 
        // Actually User.js wasn't fully viewed but auth.js uses it.
        // Let's assume User.findById returns the user object directly.
        // Wait, in auth.js line 107: const user = await User.findById(req.user.id);

        // We need password hash for comparison. 
        // Let's check if User.findById returns it. Usually it does.
        // If not, we might need a direct query. 
        // Let's rely on standard practice for now or check User.js if unsure. 
        // Looking at schema, password_hash is in users table.

        // However, findById might exclude it for security?
        // Let's do a direct query to be safe or assuming findByEmail logic.
        const pool = require('../config/database');
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
        const fullUser = rows[0];

        const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
