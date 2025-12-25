const Booking = require('./models/Booking');
const pool = require('./config/database');

// Mock user context - need a user ID. 
// From previous steps, desmondlwc123@gmail.com is ID 5.

async function checkBookings() {
    try {
        const userId = 5;
        console.log(`Checking bookings for User ID: ${userId}`);

        // 1. Check raw DB rows for this user
        const [rawRows] = await pool.execute('SELECT * FROM bookings WHERE user_id = ?', [userId]);
        console.log('--- Raw DB Rows ---');
        console.log(JSON.stringify(rawRows, null, 2));

        // 2. Check Booking.findByUserId result
        const bookings = await Booking.findByUserId(userId);
        console.log('--- Booking.findByUserId Result ---');
        console.log(JSON.stringify(bookings, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBookings();
