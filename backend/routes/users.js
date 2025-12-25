const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// ...

// @route   POST /api/users
// @desc    Create a new user (Admin)
// @access  Admin
router.post('/', [auth, adminAuth], async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const pool = require('../config/database');

        // Check if user exists
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await pool.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role || 'user']
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/users
// @desc    Get all users (for search/dropdowns)
// @access  Private
// @route   PUT /api/users/:id
// @desc    Update user details (role)
// @access  Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
    const { role, name } = req.body;
    try {
        const pool = require('../config/database');

        let fields = [];
        let values = [];

        if (role) {
            fields.push('role = ?');
            values.push(role);
        }
        if (name) {
            fields.push('name = ?');
            values.push(name);
        }

        if (fields.length > 0) {
            values.push(req.params.id);
            await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        }

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin gets full list, Users might use for search)
router.get('/', auth, async (req, res) => {
    try {
        // Return necessary info. Admin needs role/created_at using this same endpoint for now.
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id != ? ORDER BY name ASC', [req.user.id]);
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        if (req.params.id == req.user.id) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }
        const pool = require('../config/database');
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
