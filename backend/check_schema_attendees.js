const pool = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.execute('DESCRIBE booking_attendees');
        console.log(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
