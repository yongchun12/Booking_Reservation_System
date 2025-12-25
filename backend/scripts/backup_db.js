const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const fileName = `db_backup_${timestamp}.sql`;
const filePath = path.join(BACKUP_DIR, fileName);

// Command to dump database (adjust user/pass from env)
const dumpCommand = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filePath}`;

console.log('Starting DB Backup...');

exec(dumpCommand, async (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup Error: ${error.message}`);
        return;
    }

    console.log('Database dumped locally. Uploading to S3...');

    try {
        const fileContent = fs.readFileSync(filePath);
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `backups/${fileName}`,
            Body: fileContent
        });

        await s3.send(command);
        console.log(`Backup uploaded successfully to s3://${process.env.AWS_S3_BUCKET_NAME}/backups/${fileName}`);

        // Cleanup local file
        fs.unlinkSync(filePath);
        console.log('Local backup file cleaned up.');

    } catch (err) {
        console.error('S3 Upload Error:', err);
    }
});
