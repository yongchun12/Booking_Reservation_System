const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Check if S3 credentials are available
const hasS3Creds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME;

let storage;

if (hasS3Creds) {
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    });

    storage = multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `bookings/${Date.now().toString()}_${file.originalname}`);
        }
    });
} else {
    // Fallback to memory storage if no S3 creds
    // This allows requests to pass even if upload won't reach S3
    console.warn("AWS Credentials missing. File upload will rely on memory storage (Mock).");
    storage = multer.memoryStorage();
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
