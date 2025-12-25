const express = require('express');
const router = express.Router();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require("@smithy/node-http-handler");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000,
        socketTimeout: 3000,
    }),
});

// @route   GET /api/images/:key
// @desc    Proxy image from S3
router.get('/*', async (req, res) => {
    const key = req.params[0]; // Capture wildcard

    if (!key) {
        return res.status(400).send('No key provided');
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        });

        const response = await s3.send(command);

        // Set headers
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Pipe stream
        response.Body.pipe(res);
    } catch (err) {
        console.error('S3 Proxy Error:', err);
        if (err.name === 'NoSuchKey') {
            return res.status(404).send('Image not found');
        }
        res.status(500).send('Error fetching image');
    }
});

module.exports = router;
