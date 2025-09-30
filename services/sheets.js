const { google } = require('googleapis');
const path = require('path');

let sheets = null;
let auth = null;

async function initializeSheets() {
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
    } else if (process.env.GOOGLE_API_KEY) {
      auth = process.env.GOOGLE_API_KEY;
    } else {
      throw new Error('No Google authentication method configured');
    }

    sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
    throw error;
  }
}

async function addParticipantToSheet(participantData) {
  try {
    if (!sheets) {
      await initializeSheets();
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }

    const values = [[
      participantData.timestamp,
      participantData.name,
      participantData.email,
      participantData.location,
      participantData.lat,
      participantData.lng,
      participantData.interests,
      participantData.message
    ]];

    const request = {
      spreadsheetId,
      range: 'Sheet1!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values
      }
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log('Added participant to sheet:', participantData.name);
    return response.data;
  } catch (error) {
    console.error('Error adding participant to sheet:', error);
    throw error;
  }
}

async function getParticipants() {
  try {
    if (!sheets) {
      await initializeSheets();
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:H'
    });

    const rows = response.data.values || [];
    const participants = rows.map((row, index) => ({
      id: index + 1,
      timestamp: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      location: row[3] || '',
      lat: parseFloat(row[4]) || 0,
      lng: parseFloat(row[5]) || 0,
      interests: row[6] || '',
      message: row[7] || ''
    }));

    return participants;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
}

async function createSheetIfNotExists() {
  try {
    if (!sheets) {
      await initializeSheets();
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      console.log('Creating new spreadsheet...');
      const resource = {
        properties: {
          title: 'Like-Minded People Geography'
        }
      };

      const spreadsheet = await sheets.spreadsheets.create({
        resource,
        fields: 'spreadsheetId'
      });

      console.log('Created spreadsheet with ID:', spreadsheet.data.spreadsheetId);
      console.log('Please add this ID to your .env file as GOOGLE_SHEET_ID');

      const headers = [['Timestamp', 'Name', 'Email', 'Location', 'Latitude', 'Longitude', 'Interests', 'Message']];
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.data.spreadsheetId,
        range: 'Sheet1!A1:H1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: headers
        }
      });

      return spreadsheet.data.spreadsheetId;
    }

    try {
      await sheets.spreadsheets.get({ spreadsheetId });
      console.log('Spreadsheet exists:', spreadsheetId);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:H1'
      });

      if (!response.data.values || response.data.values.length === 0) {
        const headers = [['Timestamp', 'Name', 'Email', 'Location', 'Latitude', 'Longitude', 'Interests', 'Message']];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1:H1',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: headers
          }
        });
        console.log('Added headers to spreadsheet');
      }
    } catch (error) {
      console.error('Error accessing spreadsheet:', error);
      throw error;
    }

    return spreadsheetId;
  } catch (error) {
    console.error('Error creating/checking spreadsheet:', error);
    throw error;
  }
}

module.exports = {
  addParticipantToSheet,
  getParticipants,
  createSheetIfNotExists
};