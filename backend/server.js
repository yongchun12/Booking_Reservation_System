const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const logger = require('./utils/logger');

const path = require('path');
const express = require('express');

// Serve static uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
