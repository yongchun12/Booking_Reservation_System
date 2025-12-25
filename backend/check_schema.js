const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("--- TABLE: bookings ---");
        const [bookings] = await pool.query("DESCRIBE bookings");
        console.table(bookings);

        console.log("\n--- TABLE: users ---");
        const [users] = await pool.query("DESCRIBE users");
        console.table(users);

        console.log("\n--- TABLE: booking_attendees ---");
        const [attendees] = await pool.query("DESCRIBE booking_attendees");
        console.table(attendees);

        process.exit(0);
    } catch (err) {
        console.error("DB Check Failed:", err);
        process.exit(1);
    }
}

checkSchema();
