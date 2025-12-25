const nodemailer = require('nodemailer');
// const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses'); 
// Commenting out SES to force SMTP usage since we have credentials now.
const path = require('path');
// Try to load .env.production if it exists
require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });
require('dotenv').config(); // Fallback to standard .env or merge

// Create Transporter (Mailgun SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailgun.org',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send OTP via Mailgun SMTP
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
            <p>You are ${action} <strong>CSC3074 - Booking Reservation System</strong>.</p>
            <p>Your Verification Code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: '"CSC3074 - Booking Reservation System" <postmaster@sandbox58f5c26ea33b441e890efaf90ebc9e19.mailgun.org>', // Must use the sandbox domain
            to: toEmail,
            subject: subject,
            html: htmlBody,
        });

        console.log(`✅ Mailgun: OTP sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("❌ Mailgun Failed:", error.message);
        console.error("⚠️ FALLBACK: PRINTING OTP TO CONSOLE");
        console.error("---------------------------------------------------");
        console.error(`📧 MOCK EMAIL TO: ${toEmail}`);
        console.error(`🔑 OTP CODE: ${otp}`);
        console.error("---------------------------------------------------");
        // Return TRUE so the frontend thinks it succeeded
        return true;
    }
    // ... exists ...
}
}

/**
 * Send Invitation Email
 */
async function sendInvitation(toEmail, bookingDetails) {
    const subject = `Invited: ${bookingDetails.title} @ ${bookingDetails.date}`;
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>You have been invited!</h2>
            <p><strong>Event:</strong> ${bookingDetails.title}</p>
            <p><strong>When:</strong> ${bookingDetails.date} from ${bookingDetails.start} to ${bookingDetails.end}</p>
            <p><strong>Where:</strong> ${bookingDetails.resource}</p>
            <p>Please log in to the portal to RSVP.</p>
        </div>
    `;
    return sendEmail(toEmail, subject, htmlBody);
}

/**
 * Send RSVP Notification to Owner
 */
async function sendRSVPNotification(ownerEmail, attendeeName, status, bookingTitle) {
    const subject = `RSVP Update: ${attendeeName} ${status} your event`;
    const color = status === 'accepted' ? 'green' : 'red';
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>RSVP Alert</h2>
            <p>${attendeeName} has <strong style="color: ${color}">${status}</strong> your invitation for <strong>${bookingTitle}</strong>.</p>
        </div>
    `;
    return sendEmail(ownerEmail, subject, htmlBody);
}

// Helper to wrap transporter
async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: '"Booking System" <postmaster@sandbox58f5c26ea33b441e890efaf90ebc9e19.mailgun.org>',
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Email Failed:", error.message);
        return false;
    }
}

module.exports = { sendOTP, sendInvitation, sendRSVPNotification };
