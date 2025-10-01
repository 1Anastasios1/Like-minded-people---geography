const { google } = require('googleapis');
const { Client } = require('@googlemaps/google-maps-services-js');

let mapsClient = null;
let mymaps = null;
let auth = null;

async function initializeMaps() {
  try {
    if (process.env.GOOGLE_MAPS_API_KEY) {
      mapsClient = new Client({});
    }

    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/mapsengine']
      });
      mymaps = google.mapsengine({ version: 'v1', auth });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/mapsengine']
      });
      mymaps = google.mapsengine({ version: 'v1', auth });
    }

    return { mapsClient, mymaps };
  } catch (error) {
    console.error('Failed to initialize Maps:', error);
    throw error;
  }
}

async function addMarkerToMap(participantData) {
  try {
    if (!mapsClient && !mymaps) {
      await initializeMaps();
    }

    const mapData = {
      id: Date.now().toString(),
      name: participantData.name,
      location: participantData.location,
      lat: participantData.lat,
      lng: participantData.lng,
      interests: participantData.interests,
      message: participantData.message,
      timestamp: participantData.timestamp
    };

    console.log('Marker data prepared for:', participantData.name);

    return {
      success: true,
      marker: mapData,
      message: 'Marker prepared successfully. Manual addition to Google My Maps may be required.'
    };
  } catch (error) {
    console.error('Error adding marker to map:', error);
    throw error;
  }
}

async function geocodeAddress(address) {
  try {
    if (!mapsClient) {
      await initializeMaps();
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }

    const response = await mapsClient.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: response.data.results[0].formatted_address
      };
    } else {
      throw new Error('No results found for the address');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

module.exports = {
  addMarkerToMap,
  geocodeAddress,
  validateCoordinates
};