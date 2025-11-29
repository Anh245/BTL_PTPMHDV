/**
 * Train Type Definitions
 * 
 * This module provides type definitions for train-related data structures
 * to ensure consistent typing across the application.
 */

/**
 * @typedef {Object} NormalizedTrain
 * @property {string} id - Consistent ID field for frontend use (primary)
 * @property {string} _id - MongoDB ID for backend compatibility
 * @property {string} name - Train name
 * @property {string} trainNumber - Train number/identifier
 * @property {number} [totalSeats] - Total number of seats (optional)
 * @property {'active'|'inactive'|'maintenance'} status - Train operational status
 * @property {string} [createdAt] - Creation timestamp (optional)
 * @property {string} [updatedAt] - Last update timestamp (optional)
 */

/**
 * @typedef {Object} TrainFormData
 * @property {string} name - Train name
 * @property {string} trainNumber - Train number/identifier  
 * @property {number} totalSeats - Total number of seats
 * @property {'active'|'inactive'|'maintenance'} status - Train operational status
 */

/**
 * @typedef {Object} RawTrainData
 * @property {string} [id] - Frontend ID field
 * @property {string} [_id] - MongoDB ID field
 * @property {string} name - Train name
 * @property {string} trainNumber - Train number/identifier
 * @property {number} [totalSeats] - Total number of seats
 * @property {'active'|'inactive'|'maintenance'} status - Train operational status
 * @property {string} [createdAt] - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} TrainApiResponse
 * @property {RawTrainData|RawTrainData[]} data - Train data from API
 * @property {string} [message] - Response message
 * @property {boolean} [success] - Success status
 */

// Export empty object to make this a module
export {};