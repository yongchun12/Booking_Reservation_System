const pool = require('../config/database');

class Booking {
    static async create(data) {
        const { user_id, resource_id, booking_date, start_time, end_time, notes = null, attachment_url = null, status = 'pending' } = data;
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, resource_id, booking_date, start_time, end_time, notes, attachment_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, resource_id, booking_date, start_time, end_time, notes, attachment_url, status]
        );
        return result.insertId;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT b.*, r.name as resource_name, r.type as resource_type 
             FROM bookings b 
             JOIN resources r ON b.resource_id = r.id 
             WHERE b.user_id = ? 
             ORDER BY b.booking_date DESC, b.start_time DESC`,
            [userId]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT b.*, u.name as user_name, u.email as user_email, r.name as resource_name 
             FROM bookings b 
             JOIN users u ON b.user_id = u.id 
             JOIN resources r ON b.resource_id = r.id 
             ORDER BY b.booking_date DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        return rows[0];
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async updateAttendeeStatus(bookingId, userId, status) {
        const [result] = await pool.execute(
            'UPDATE booking_attendees SET status = ? WHERE booking_id = ? AND user_id = ?',
            [status, bookingId, userId]
        );
        return result.affectedRows > 0;
    }

    static async getAttendees(bookingId) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.name, u.email, ba.status 
             FROM booking_attendees ba 
             JOIN users u ON ba.user_id = u.id 
             WHERE ba.booking_id = ?`,
            [bookingId]
        );
        return rows;
    }

    static async checkAvailability(resourceId, date, startTime, endTime) {
        // Simple overlap check
        const [rows] = await pool.execute(
            `SELECT * FROM bookings 
             WHERE resource_id = ? 
             AND booking_date = ? 
             AND status != 'cancelled'
             AND (
                (start_time < ? AND end_time > ?)
             )`,
            [resourceId, date, endTime, startTime]
        );
        return rows.length === 0; // True if no overlapping bookings
    }
}

module.exports = Booking;
