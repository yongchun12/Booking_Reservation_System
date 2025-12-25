const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const schema = `
-- Drop Tables (Order Matters)
DROP TABLE IF EXISTS booking_attendees;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS resource_categories;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resource Categories
CREATE TABLE resource_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    capacity INT,
    location VARCHAR(100),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES resource_categories(id)
);

-- Time Slots
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    day_of_week TINYINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- Bookings
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- Booking Attendees
CREATE TABLE booking_attendees (
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (booking_id, user_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const seedData = async (pool) => {
    // Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@admin.com', hashedPassword, 'admin']
    );

    // Regular User
    await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Test User', 'user@test.com', hashedPassword, 'user']
    );

    // Categories
    await pool.query(`
        INSERT INTO resource_categories (name, description) VALUES 
        ('Meeting Room', 'Private rooms'),
        ('Hall', 'Large venues'),
        ('Equipment', 'Devices')
    `);

    // Resources
    await pool.query(`
        INSERT INTO resources (name, description, type, capacity, location, category_id) VALUES 
        ('Meeting Room A', 'Small meeting room', 'room', 6, 'Level 1', 1),
        ('Grand Hall', 'Main event hall', 'hall', 200, 'Level G', 2),
        ('Projector X1', 'High def projector', 'equipment', 1, 'Store A', 3)
    `);

    console.log("Seed data inserted.");
};

async function resetDb() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME, // Connect to DB directly
            multipleStatements: true
        });

        console.log("Executing Schema Reset...");
        await pool.query(schema);
        console.log("Schema Created.");

        console.log("Seeding Data...");
        await seedData(pool);

        console.log("Database Reset Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Reset Failed:", err);
        process.exit(1);
    }
}

resetDb();
