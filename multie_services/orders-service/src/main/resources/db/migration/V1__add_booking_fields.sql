-- Migration script to add booking management fields to orders table
-- This script adds passenger_details, confirmation_code, and confirmed_at fields

ALTER TABLE orders
ADD COLUMN passenger_details TEXT COMMENT 'JSON array of passenger information',
ADD COLUMN confirmation_code VARCHAR(50) UNIQUE COMMENT 'Unique confirmation code for confirmed orders',
ADD COLUMN confirmed_at DATETIME COMMENT 'Timestamp when order was confirmed';

-- Add index on confirmation_code for faster lookups
CREATE INDEX idx_confirmation_code ON orders(confirmation_code);
