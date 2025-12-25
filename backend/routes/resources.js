const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../utils/s3Upload');
const db = require('../config/database');

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public (or Private) -> Let's make it Public for viewing
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/resources
// @desc    Create a resource
// @access  Private (Admin)
router.post('/', [auth, adminAuth, upload.single('image')], async (req, res) => {
    try {
        const { name, type, capacity, description, location } = req.body;

        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.location;
        }

        const [result] = await db.query(
            'INSERT INTO resources (name, type, capacity, description, location, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, capacity, description, location, imageUrl]
        );

        res.status(201).json({ id: result.insertId, name, type, capacity, description, location, image_url: imageUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
// @access  Admin
router.put('/:id', [auth, adminAuth, upload.single('image')], async (req, res) => {
    try {
        const { name, type, capacity, description, location } = req.body;

        let updateFields = [];
        let updateValues = [];

        if (name) { updateFields.push('name = ?'); updateValues.push(name); }
        if (type) { updateFields.push('type = ?'); updateValues.push(type); }
        if (capacity) { updateFields.push('capacity = ?'); updateValues.push(capacity); }
        if (description) { updateFields.push('description = ?'); updateValues.push(description); }
        if (location) { updateFields.push('location = ?'); updateValues.push(location); }

        if (req.file) {
            updateFields.push('image_url = ?');
            updateValues.push(req.file.location);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(req.params.id);

        await db.query(
            `UPDATE resources SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ message: 'Resource updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/resources/:id
// @desc    Delete (soft) a resource
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const success = await Resource.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
