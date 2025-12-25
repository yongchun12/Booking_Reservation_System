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
    // Fallback to local disk storage if no S3 creds
    const fs = require('fs');
    const path = require('path');

    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.warn("AWS Credentials missing. Using local storage: " + uploadDir);

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Sanitize original name
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, uniqueSuffix + '-' + sanitizedName);
        }
    });

}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
