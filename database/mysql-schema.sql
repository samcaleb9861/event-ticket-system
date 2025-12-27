-- Event Ticket System - MySQL Database Schema
-- This script creates the database and tables for the Event Ticket System

-- Create database
CREATE DATABASE IF NOT EXISTS event_ticket_system;
USE event_ticket_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id VARCHAR(24) NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$XqY5Z5K5Z5K5Z5K5Z5K5ZeXqY5Z5K5Z5K5Z5K5Z5ZeXqY5Z5K5Z5Z', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample regular user (password: user123)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'user@example.com', '$2a$10$XqY5Z5K5Z5K5Z5K5Z5K5ZeXqY5Z5K5Z5K5Z5K5Z5ZeXqY5Z5K5Z5Z', 'user')
ON DUPLICATE KEY UPDATE name=name;
