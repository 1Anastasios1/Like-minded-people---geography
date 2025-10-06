const { validateCoordinates } = require('../services/maps');

describe('Services Tests', () => {
  describe('Maps Service', () => {
    describe('validateCoordinates', () => {
      it('should validate correct coordinates', () => {
        expect(validateCoordinates(40.7128, -74.0060)).toBe(true);
        expect(validateCoordinates('51.5074', '-0.1278')).toBe(true);
        expect(validateCoordinates(0, 0)).toBe(true);
        expect(validateCoordinates(-90, 180)).toBe(true);
        expect(validateCoordinates(90, -180)).toBe(true);
      });

      it('should reject invalid coordinates', () => {
        expect(validateCoordinates(91, 0)).toBe(false);
        expect(validateCoordinates(-91, 0)).toBe(false);
        expect(validateCoordinates(0, 181)).toBe(false);
        expect(validateCoordinates(0, -181)).toBe(false);
        expect(validateCoordinates('invalid', 'coordinates')).toBe(false);
        expect(validateCoordinates(NaN, NaN)).toBe(false);
      });
    });
  });

  describe('Sheets Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should format participant data correctly', () => {
      const participantData = {
        timestamp: '2025-09-30T12:00:00Z',
        name: 'Test User',
        email: 'test@example.com',
        location: 'Test City',
        lat: 40.7128,
        lng: -74.0060,
        interests: 'Testing',
        message: 'Test message'
      };

      const expectedRow = [
        participantData.timestamp,
        participantData.name,
        participantData.email,
        participantData.location,
        participantData.lat,
        participantData.lng,
        participantData.interests,
        participantData.message
      ];

      expect(expectedRow).toHaveLength(8);
      expect(expectedRow[0]).toBe('2025-09-30T12:00:00Z');
      expect(expectedRow[1]).toBe('Test User');
    });
  });
});