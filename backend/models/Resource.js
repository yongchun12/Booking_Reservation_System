const pool = require('../config/database');

class Resource {
    static async create(data) {
        const { name, description, type, capacity, location, image_url } = data;
        const [result] = await pool.execute(
            'INSERT INTO resources (name, description, type, capacity, location, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, type, capacity, location, image_url]
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await pool.execute('SELECT * FROM resources WHERE is_active = TRUE');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM resources WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, data) {
        const { name, description, type, capacity, location, image_url, is_active } = data;
        // Construct query dynamically or just update all fields
        const [result] = await pool.execute(
            `UPDATE resources 
             SET name=?, description=?, type=?, capacity=?, location=?, image_url=?, is_active=?
             WHERE id=?`,
            [name, description, type, capacity, location, image_url, is_active, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        // Soft delete
        const [result] = await pool.execute(
            'UPDATE resources SET is_active = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Resource;
