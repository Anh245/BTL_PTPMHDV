/**
 * Train Data Normalization Utilities
 * 
 * This module provides utilities for normalizing train data to ensure consistent
 * ID field handling across the application, addressing the train edit bug.
 */

/**
 * Validates if a value can be used as a valid ID
 * @param {any} id - The ID value to validate
 * @returns {boolean} - True if the ID is valid
 */
export const isValidId = (id) => {
  return id !== null && id !== undefined && id !== '' && String(id).trim() !== '';
};

/**
 * Converts an ID to a consistent string format
 * @param {any} id - The ID to convert
 * @returns {string|null} - The converted ID or null if invalid
 */
export const convertIdToString = (id) => {
  if (!isValidId(id)) {
    return null;
  }
  return String(id).trim();
};

/**
 * Normalizes train data to ensure consistent ID field handling
 * Prioritizes _id (MongoDB) over id, but ensures both fields exist for compatibility
 * 
 * @param {Object} train - The train data object to normalize
 * @returns {NormalizedTrain} - The normalized train data
 */
export const normalizeTrainData = (train) => {
  if (!train || typeof train !== 'object') {
    throw new Error('Invalid train data: expected object');
  }

  // Determine the primary ID - prioritize _id (MongoDB) if it exists and is valid
  let primaryId = null;
  let secondaryId = null;

  if (isValidId(train._id)) {
    primaryId = convertIdToString(train._id);
    secondaryId = isValidId(train.id) ? convertIdToString(train.id) : primaryId;
  } else if (isValidId(train.id)) {
    primaryId = convertIdToString(train.id);
    secondaryId = primaryId;
  } else {
    throw new Error('Invalid train data: missing valid ID field');
  }

  // Create normalized train object
  const normalizedTrain = {
    ...train,
    id: primaryId,        // Consistent ID field for frontend use
    _id: secondaryId,     // Preserve for backend compatibility
  };

  return normalizedTrain;
};

/**
 * Normalizes an array of train data objects
 * @param {Array} trains - Array of train data objects
 * @returns {Array<NormalizedTrain>} - Array of normalized train data
 */
export const normalizeTrainArray = (trains) => {
  if (!Array.isArray(trains)) {
    throw new Error('Invalid trains data: expected array');
  }

  return trains.map((train, index) => {
    try {
      return normalizeTrainData(train);
    } catch (error) {
      console.error(`Error normalizing train at index ${index}:`, error);
      throw new Error(`Failed to normalize train at index ${index}: ${error.message}`);
    }
  });
};

/**
 * Extracts the correct ID for API operations
 * Uses _id for backend API calls when available, falls back to id
 * 
 * @param {NormalizedTrain} train - The normalized train object
 * @returns {string} - The ID to use for API calls
 */
export const getApiId = (train) => {
  if (!train || typeof train !== 'object') {
    throw new Error('Invalid train data for API ID extraction');
  }

  // For API calls, prefer _id (MongoDB format) if available
  if (isValidId(train._id)) {
    return convertIdToString(train._id);
  }
  
  if (isValidId(train.id)) {
    return convertIdToString(train.id);
  }

  throw new Error('No valid ID found for API operation');
};

/**
 * Validates that a train object has the required normalized structure
 * @param {any} train - The train object to validate
 * @returns {boolean} - True if the train has valid normalized structure
 */
export const isNormalizedTrain = (train) => {
  return !!(
    train &&
    typeof train === 'object' &&
    isValidId(train.id) &&
    isValidId(train._id)
  );
};

/**
 * Type definitions for TypeScript support (JSDoc format)
 * 
 * @typedef {Object} NormalizedTrain
 * @property {string} id - Consistent ID field for frontend use
 * @property {string} _id - MongoDB ID for backend compatibility
 * @property {string} name - Train name
 * @property {string} trainNumber - Train number/identifier
 * @property {number} [totalSeats] - Total number of seats
 * @property {'active'|'inactive'|'maintenance'} status - Train operational status
 * @property {string} [createdAt] - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} TrainFormData
 * @property {string} name - Train name
 * @property {string} trainNumber - Train number/identifier
 * @property {number} totalSeats - Total number of seats
 * @property {'active'|'inactive'|'maintenance'} status - Train operational status
 */