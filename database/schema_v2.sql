-- Schema V2: Additions for Modern Features

-- Resource Categories (for better organization)
CREATE TABLE IF NOT EXISTS resource_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to resources table
-- ALTER TABLE resources ADD COLUMN category_id INT;
-- ALTER TABLE resources ADD CONSTRAINT fk_resource_category FOREIGN KEY (category_id) REFERENCES resource_categories(id);

-- Audit Logs (for Admin transparency)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Notifications (for real-time updates)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Insert default categories
INSERT INTO
    resource_categories (name, description)
VALUES (
        'Meeting Room',
        'Private rooms for discussions'
    ),
    (
        'Equipment',
        'Projectors, Laptops, etc.'
    ),
    (
        'Hall',
        'Large venues for events'
    )
ON DUPLICATE KEY UPDATE
    name = name;