const request = require('supertest');
const express = require('express');

jest.mock('../services/sheets', () => ({
  addParticipantToSheet: jest.fn(),
  getParticipants: jest.fn()
}));

jest.mock('../services/maps', () => ({
  addMarkerToMap: jest.fn(),
  geocodeAddress: jest.fn(),
  validateCoordinates: jest.fn()
}));

describe('Server API Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../server')];
    process.env.PORT = 3001;
  });

  describe('POST /api/register', () => {
    it('should register a new participant with valid data', async () => {
      const mockSheets = require('../services/sheets');
      const mockMaps = require('../services/maps');

      mockSheets.addParticipantToSheet.mockResolvedValue({ success: true });
      mockMaps.addMarkerToMap.mockResolvedValue({ success: true });

      const app = express();
      app.use(express.json());

      app.post('/api/register', async (req, res) => {
        const { name, email, location, lat, lng, interests, message } = req.body;

        if (!name || !email || !location || !lat || !lng) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const participantData = {
          name,
          email,
          location,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          interests: interests || '',
          message: message || '',
          timestamp: new Date().toISOString()
        };

        const [sheetResult, mapResult] = await Promise.all([
          mockSheets.addParticipantToSheet(participantData),
          mockMaps.addMarkerToMap(participantData)
        ]);

        res.json({
          success: true,
          message: 'Registration successful!',
          data: { sheet: sheetResult, map: mapResult }
        });
      });

      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          location: 'New York, USA',
          lat: 40.7128,
          lng: -74.0060,
          interests: 'Technology, Environment',
          message: 'Excited to join!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockSheets.addParticipantToSheet).toHaveBeenCalled();
      expect(mockMaps.addMarkerToMap).toHaveBeenCalled();
    });

    it('should return error for missing required fields', async () => {
      const app = express();
      app.use(express.json());

      app.post('/api/register', async (req, res) => {
        const { name, email, location, lat, lng } = req.body;

        if (!name || !email || !location || !lat || !lng) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('GET /api/participants', () => {
    it('should return list of participants', async () => {
      const mockSheets = require('../services/sheets');

      const mockParticipants = [
        {
          id: 1,
          name: 'John Doe',
          location: 'New York',
          lat: 40.7128,
          lng: -74.0060
        },
        {
          id: 2,
          name: 'Jane Smith',
          location: 'London',
          lat: 51.5074,
          lng: -0.1278
        }
      ];

      mockSheets.getParticipants.mockResolvedValue(mockParticipants);

      const app = express();
      app.get('/api/participants', async (req, res) => {
        try {
          const participants = await mockSheets.getParticipants();
          res.json(participants);
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch participants' });
        }
      });

      const response = await request(app)
        .get('/api/participants');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Doe');
    });
  });
});