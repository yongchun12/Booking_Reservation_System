const pool = require('./config/database');

async function checkAndFixSchema() {
    try {
        console.log("--- Checking booking_attendees schema ---");
        const [columns] = await pool.execute("SHOW COLUMNS FROM booking_attendees");
        console.log(JSON.stringify(columns, null, 2));

        const hasStatus = columns.some(c => c.Field === 'status');
        if (!hasStatus) {
            console.log("--- Missing 'status' column. Adding it... ---");
            await pool.execute("ALTER TABLE booking_attendees ADD COLUMN status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending'");
            console.log("Column added successfully.");
        } else {
            console.log("'status' column already exists.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAndFixSchema();
