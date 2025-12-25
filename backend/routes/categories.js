const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const pool = require('../config/database');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public (or Private)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM resource_categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Admin
router.post('/', [auth, adminAuth], async (req, res) => {
    const { name, description } = req.body;
    try {
        await pool.execute('INSERT INTO resource_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        console.error(err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
    const { name, description } = req.body;
    try {
        await pool.execute('UPDATE resource_categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
        res.json({ message: 'Category updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        // Optional: Check if used by resources?
        // For now, let's allow delete.
        await pool.execute('DELETE FROM resource_categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
