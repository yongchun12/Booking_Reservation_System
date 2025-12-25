const { SESClient, VerifyEmailIdentityCommand } = require('@aws-sdk/client-ses');
const { NodeHttpHandler } = require("@smithy/node-http-handler");
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env.production first, then .env
dotenv.config({ path: path.resolve(__dirname, '.env.production') });
dotenv.config({ path: path.resolve(__dirname, '.env') }); // Fallback/Override

const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
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

async function verifyEmail(email) {
    console.log(`Attempting to verify: ${email}`);
    console.log(`Using Region: ${process.env.AWS_REGION}`);
    console.log(`Using Key: ${process.env.AWS_ACCESS_KEY_ID ? '...' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'NONE'}`);

    const command = new VerifyEmailIdentityCommand({
        EmailAddress: email,
    });

    try {
        await ses.send(command);
        console.log('---------------------------------------------------');
        console.log(`✅ SUCCESS! Verification email sent to: ${email}`);
        console.log('👉 Please check your Inbox (and Spam folder).');
        console.log('👉 Click the link from Amazon Web Services to complete verification.');
        console.log('---------------------------------------------------');
    } catch (error) {
        console.error('❌ ERROR: Could not send verification request.');
        console.error(error.message);
        if (error.Code === 'MessageRejected') {
            console.error('Note: If you are in Sandbox, you must verify both SENDER and RECEIVER.');
        }
    }
}

// Default to the email we saw earlier, or allow arg
const emailToVerify = process.argv[2] || 'yongchun_sam@hotmail.com';
verifyEmail(emailToVerify);
