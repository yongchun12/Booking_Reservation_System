
const db = require('./config/database');

async function migrate() {
    try {
        console.log("Creating booking_attendees table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_attendees (
                booking_id INT NOT NULL,
                user_id INT NOT NULL,
                PRIMARY KEY (booking_id, user_id),
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
