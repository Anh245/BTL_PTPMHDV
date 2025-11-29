/**
 * Tests for Train Data Normalization Utilities
 */

import {
  isValidId,
  convertIdToString,
  normalizeTrainData,
  normalizeTrainArray,
  getApiId,
  isNormalizedTrain
} from '../trainDataUtils.js';

describe('Train Data Normalization Utilities', () => {
  describe('isValidId', () => {
    test('should return true for valid IDs', () => {
      expect(isValidId('123')).toBe(true);
      expect(isValidId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidId(123)).toBe(true);
    });

    test('should return false for invalid IDs', () => {
      expect(isValidId(null)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId('')).toBe(false);
      expect(isValidId('   ')).toBe(false);
    });
  });

  describe('convertIdToString', () => {
    test('should convert valid IDs to strings', () => {
      expect(convertIdToString(123)).toBe('123');
      expect(convertIdToString('abc')).toBe('abc');
      expect(convertIdToString('  123  ')).toBe('123');
    });

    test('should return null for invalid IDs', () => {
      expect(convertIdToString(null)).toBe(null);
      expect(convertIdToString('')).toBe(null);
    });
  });

  describe('normalizeTrainData', () => {
    test('should normalize train with _id field', () => {
      const train = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Express Train',
        trainNumber: 'SE1',
        status: 'active'
      };

      const normalized = normalizeTrainData(train);
      
      expect(normalized.id).toBe('507f1f77bcf86cd799439011');
      expect(normalized._id).toBe('507f1f77bcf86cd799439011');
      expect(normalized.name).toBe('Express Train');
    });

    test('should normalize train with id field', () => {
      const train = {
        id: '123',
        name: 'Local Train',
        trainNumber: 'SE2',
        status: 'inactive'
      };

      const normalized = normalizeTrainData(train);
      
      expect(normalized.id).toBe('123');
      expect(normalized._id).toBe('123');
    });

    test('should prioritize _id over id when both exist', () => {
      const train = {
        id: '123',
        _id: '507f1f77bcf86cd799439011',
        name: 'Priority Test',
        trainNumber: 'SE3',
        status: 'maintenance'
      };

      const normalized = normalizeTrainData(train);
      
      expect(normalized.id).toBe('507f1f77bcf86cd799439011');
      expect(normalized._id).toBe('123');
    });

    test('should throw error for invalid train data', () => {
      expect(() => normalizeTrainData(null)).toThrow('Invalid train data: expected object');
      expect(() => normalizeTrainData({})).toThrow('Invalid train data: missing valid ID field');
    });
  });

  describe('normalizeTrainArray', () => {
    test('should normalize array of trains', () => {
      const trains = [
        { _id: '1', name: 'Train 1', trainNumber: 'SE1', status: 'active' },
        { id: '2', name: 'Train 2', trainNumber: 'SE2', status: 'inactive' }
      ];

      const normalized = normalizeTrainArray(trains);
      
      expect(normalized).toHaveLength(2);
      expect(normalized[0].id).toBe('1');
      expect(normalized[1].id).toBe('2');
    });

    test('should throw error for non-array input', () => {
      expect(() => normalizeTrainArray(null)).toThrow('Invalid trains data: expected array');
    });
  });

  describe('getApiId', () => {
    test('should return _id for API calls when available', () => {
      const train = { id: '123', _id: '507f1f77bcf86cd799439011' };
      expect(getApiId(train)).toBe('507f1f77bcf86cd799439011');
    });

    test('should fallback to id when _id not available', () => {
      const train = { id: '123' };
      expect(getApiId(train)).toBe('123');
    });

    test('should throw error when no valid ID found', () => {
      expect(() => getApiId({})).toThrow('No valid ID found for API operation');
    });
  });

  describe('isNormalizedTrain', () => {
    test('should return true for properly normalized train', () => {
      const train = {
        id: '123',
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Train',
        status: 'active'
      };
      
      expect(isNormalizedTrain(train)).toBe(true);
    });

    test('should return false for invalid train', () => {
      expect(isNormalizedTrain(null)).toBe(false);
      expect(isNormalizedTrain({})).toBe(false);
      expect(isNormalizedTrain({ id: '123' })).toBe(false); // missing _id
    });
  });
});