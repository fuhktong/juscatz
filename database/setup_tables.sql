-- JusCatz Database Setup
-- Run this to create the necessary tables

-- Users table (main user authentication data)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Profiles table (extended user profile information)
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    display_name VARCHAR(50),
    bio TEXT,
    website VARCHAR(255),
    location VARCHAR(100),
    profile_picture VARCHAR(255),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert test user if not exists
INSERT IGNORE INTO users (id, username, email, first_name, last_name, password_hash) 
VALUES (1, 'testuser', 'test@example.com', 'Test', 'User', '$2y$10$example_hash');

-- Insert test profile if not exists
INSERT IGNORE INTO profiles (user_id, display_name, bio, website, location, is_private) 
VALUES (1, 'Test User', 'This is a test bio', 'https://example.com', 'San Francisco, CA', FALSE);