const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { addParticipantToSheet } = require('./services/sheets');
const { addMarkerToMap } = require('./services/maps');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"]
    }
  }
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', limiter);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, location, lat, lng, interests, lifeGoals, message, discord, telegram, vk, otherSocial } = req.body;

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
      lifeGoals: lifeGoals || '',
      message: message || '',
      discord: discord || '',
      telegram: telegram || '',
      vk: vk || '',
      otherSocial: otherSocial || '',
      timestamp: new Date().toISOString()
    };

    const [sheetResult, mapResult] = await Promise.all([
      addParticipantToSheet(participantData),
      addMarkerToMap(participantData)
    ]);

    console.log('Registration successful:', { name, email, location });

    res.json({
      success: true,
      message: 'Registration successful!',
      data: {
        sheet: sheetResult,
        map: mapResult
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register participant',
      message: error.message
    });
  }
});

app.get('/api/participants', async (req, res) => {
  try {
    const participants = await require('./services/sheets').getParticipants();
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});