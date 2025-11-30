-- Rollback script for V1__add_booking_fields.sql
-- This script removes the booking management fields from orders table

-- Drop the index first
DROP INDEX idx_confirmation_code ON orders;

-- Remove the columns
ALTER TABLE orders
DROP COLUMN passenger_details,
DROP COLUMN confirmation_code,
DROP COLUMN confirmed_at;
