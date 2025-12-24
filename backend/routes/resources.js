const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// Middleware to check if admin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

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
router.post('/', [auth, adminAuth], async (req, res) => {
    try {
        const id = await Resource.create(req.body);
        const newResource = await Resource.findById(id);
        res.status(201).json(newResource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const success = await Resource.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'Resource not found' });

        const updatedResource = await Resource.findById(req.params.id);
        res.json(updatedResource);
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
