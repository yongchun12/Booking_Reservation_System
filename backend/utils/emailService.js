const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { NodeHttpHandler } = require("@smithy/node-http-handler");
require('dotenv').config();

const ses = new SESClient({
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

/**
 * Send OTP via AWS SES
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} type - 'register' or 'reset'
 */
async function sendOTP(toEmail, otp, type = 'register') {
    const subject = type === 'register' ? 'Verify your Registration' : 'Reset your Password';
    const action = type === 'register' ? 'registering for' : 'resetting your password for';

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">${subject}</h2>
            <p>You are ${action} <strong>Sunway Booking System</strong>.</p>
            <p>Your Verification Code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
    `;

    const params = {
        Source: process.env.SES_SENDER_EMAIL || 'yongchun_sam@hotmail.com', // Fallback to user email if env not set
        Destination: {
            ToAddresses: [toEmail]
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: htmlBody
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        await ses.send(command);
        console.log(`OTP sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Failed to send SES email:", error);
        throw error;
    }
}

module.exports = { sendOTP };
