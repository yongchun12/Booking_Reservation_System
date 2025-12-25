const pool = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.execute('DESCRIBE users');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
