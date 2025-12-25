const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
});

async function testRead() {
    const bucket = process.env.S3_BUCKET_NAME;
    // Key derived from the DB URL we saw
    const key = 'bookings/1766640536512_Use Case Diagram.png';

    console.log(`Attempting to read ${key} from ${bucket}...`);

    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const response = await s3.send(command);
        console.log('Success! File found.');
        console.log('Content Type:', response.ContentType);
        console.log('Content Length:', response.ContentLength);
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

testRead();
