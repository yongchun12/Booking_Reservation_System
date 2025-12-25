const pool = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.execute('DESCRIBE users');
        console.log('Columns in users table:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error describing table:', err);
        process.exit(1);
    }
}

checkSchema();
