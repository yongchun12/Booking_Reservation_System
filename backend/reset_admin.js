const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config({ path: '../.env.production' });
// Note: database config usually loads env, but just in case.

async function resetPassword() {
    try {
        const email = 'admin@admin.com';
        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log(`Resetting password for ${email}...`);

        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, email]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Password updated successfully.');
            console.log(`New Password: ${newPassword}`);
        } else {
            console.log('❌ User not found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetPassword();
