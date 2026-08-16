CREATE DATABASE IF NOT EXISTS store_rating_platform;
USE store_rating_platform;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role ENUM('admin', 'normal_user', 'store_owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) NOT NULL,
    rating_value SMALLINT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store (user_id, store_id)
);

-- Seed an initial admin user
-- Password is 'Admin@123' hashed with bcrypt (cost 10)
INSERT IGNORE INTO users (id, name, email, password_hash, address, role) 
VALUES (
    UUID(),
    'System Admin',
    'admin@example.com',
    '$2b$10$wT8KzI6gCqQ/L3dZ2WwE0uu2d2yv7O0C1M4/8nQ4jB8c3aZ9f2Rz.', 
    'Admin Headquarters',
    'admin'
);
