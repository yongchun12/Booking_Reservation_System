CREATE TABLE IF NOT EXISTS resource_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories based on typical resources
INSERT IGNORE INTO
    resource_categories (name, description)
VALUES (
        'Room',
        'Meeting rooms, discussion rooms, and event halls'
    ),
    (
        'Equipment',
        'Projectors, laptops, and other electronic devices'
    ),
    (
        'Lab',
        'Computer labs and science labs'
    ),
    (
        'Sports',
        'Badminton courts, swimming pool, etc.'
    );