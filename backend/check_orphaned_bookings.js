const Booking = require('./models/Booking');
const pool = require('./config/database');

async function checkMissingBookings() {
    try {
        console.log("--- Checking ALL Bookings in Database ---");
        const [rows] = await pool.execute(`
            SELECT b.id, b.user_id, u.email, b.booking_date, b.resource_id 
            FROM bookings b 
            LEFT JOIN users u ON b.user_id = u.id
        `);
        console.log(JSON.stringify(rows, null, 2));

        const [users] = await pool.execute('SELECT id, email, name, role FROM users');
        console.log("--- Users ---");
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMissingBookings();
