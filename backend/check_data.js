const pool = require('./config/database');

async function checkData() {
    try {
        const [rows] = await pool.execute('SELECT id, email, profile_picture FROM users');
        console.log('User Data:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error fetching data:', err);
        process.exit(1);
    }
}

checkData();
