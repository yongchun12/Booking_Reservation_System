const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const { validateRegister, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register-init
// @desc    Initiate registration (Send OTP)
// @access  Public
router.post('/register-init', validateRegister, async (req, res) => {
    const { email } = req.body;
    try {
        const pool = require('../config/database');

        // Check if user exists
        // Note: User.findByEmail might not use pool directly if it's an AR model, let's use direct SQL to be safe based on recent patterns
        // actually User.findByEmail is static method. Let's use direct SQL for consistency with new code
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

        // Save OTP
        await pool.execute(
            'INSERT INTO email_verifications (email, otp, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, otp, 'register', expiresAt]
        );

        // Send Email
        const { sendOTP } = require('../utils/emailService');
        await sendOTP(email, otp, 'register');

        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// @route   POST /api/auth/register-verify
// @desc    Verify OTP and Create User
// @access  Public
router.post('/register-verify', async (req, res) => {
    const { name, email, password, role, otp } = req.body;

    try {
        const pool = require('../config/database');

        // Verify OTP
        const [records] = await pool.execute(
            'SELECT * FROM email_verifications WHERE email = ? AND type = "register" AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create User
        // Re-check existence to prevent race condition
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role || 'user']
        );

        // Clean up OTPs
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

        // Generate Token
        const payload = { user: { id: result.insertId, role: role || 'user' } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: { id: result.insertId, name, email, role: role || 'user' } });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send Reset OTP
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const pool = require('../config/database');

        // Check if user exists
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Return success even if not found to prevent enumeration, or return 404 if specific user feedback preferred.
            // User prefers specific feedback usually.
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await pool.execute(
            'INSERT INTO email_verifications (email, otp, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, otp, 'reset_password', expiresAt]
        );

        const { sendOTP } = require('../utils/emailService');
        await sendOTP(email, otp, 'reset');

        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Verify OTP and Update Password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const pool = require('../config/database');

        const [records] = await pool.execute(
            'SELECT * FROM email_verifications WHERE email = ? AND type = "reset_password" AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);

        // Clean up
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Reset failed' });
    }
});

// Old Register Route kept for backward compatibility if needed, using register-init now mainly
// @route   POST /api/auth/register (Original)
// @desc    Register user (Legacy Direct)
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
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_picture: user.profile_picture } });
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
        res.json({ user });
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
