-- Create JusCatz Database
-- Run this in phpMyAdmin or MySQL command line first

-- Create the database
CREATE DATABASE IF NOT EXISTS juscatz 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE juscatz;

-- Grant privileges (adjust username/password as needed)
-- GRANT ALL PRIVILEGES ON juscatz.* TO 'juscatz_user'@'localhost' IDENTIFIED BY 'your_password_here';
-- FLUSH PRIVILEGES;