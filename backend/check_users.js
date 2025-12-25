const pool = require('./config/database');

async function checkUser() {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, role, password_hash FROM users');
        console.log('Users found:', rows.length);
        rows.forEach(u => {
            console.log(`- ${u.id}: ${u.name} (${u.email}) [Role: ${u.role}] [Hash length: ${u.password_hash ? u.password_hash.length : 0}]`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
