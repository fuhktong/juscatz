-- Migration: Create Posts Table
-- Created: 2025-06-25
-- Description: Posts table for storing cat photos and metadata

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    user_id INT NOT NULL,
    caption TEXT,
    image_url VARCHAR(500) NOT NULL,
    image_width INT,
    image_height INT,
    image_alt_text TEXT,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_ai_verified BOOLEAN DEFAULT FALSE,
    ai_confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    ai_detected_breeds JSON, -- Store array of detected cat breeds
    hashtags JSON, -- Store array of hashtags
    mentions JSON, -- Store array of mentioned usernames
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    visibility ENUM('public', 'private', 'followers') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_uuid (uuid),
    INDEX idx_created_at (created_at),
    INDEX idx_visibility (visibility),
    INDEX idx_location (location),
    FULLTEXT INDEX idx_caption (caption)
);