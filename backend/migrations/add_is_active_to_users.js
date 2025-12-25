const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../config/database');

async function migrate() {
    try {
        console.log('Adding is_active column to users table...');

        // Check if column exists
        const [columns] = await pool.execute("SHOW COLUMNS FROM users LIKE 'is_active'");
        if (columns.length > 0) {
            console.log('Column is_active already exists.');
        } else {
            await pool.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
            console.log('Column is_active added successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
