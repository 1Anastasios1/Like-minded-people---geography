# Like-minded People Geography

A web application that allows like-minded people to add themselves to a shared Google Map and automatically sync their data to a Google Spreadsheet.

> "The geography of people united by their desire to make the world a kinder and more harmonious place."
> «География людей, которых объединяют стремление сделать мир добрее и гармоничнее»

## Features

- **Self-Registration Form**: Users can add themselves to the community map
- **Interactive Map**: Click on the map or enter an address to set your location
- **Google Sheets Integration**: Automatically saves participant data to a Google Spreadsheet
- **Community Display**: View all participants on an interactive map with their information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **APIs**: Google Maps API, Google Sheets API
- **Security**: Helmet, CORS, Rate Limiting

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Google Cloud Platform account
- Google Maps API key
- Google Sheets API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/1Anastasios1/Like-minded-people---geography.git
cd Like-minded-people---geography
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your credentials:
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `GOOGLE_SHEET_ID`: ID of your Google Sheet
   - `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`: Path to service account JSON file

### Google APIs Setup

#### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended)
6. Add the API key to `.env` and `public/index.html`

#### Google Sheets API

1. Enable **Google Sheets API** in Google Cloud Console
2. Create a service account:
   - Go to Credentials > Create Credentials > Service Account
   - Download the JSON key file
   - Save it in your project directory
3. Share your Google Sheet with the service account email
4. Add the sheet ID to `.env`

### Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `POST /api/register` - Register a new participant
- `GET /api/participants` - Get all participants

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
├── server.js           # Express server setup
├── services/
│   ├── sheets.js      # Google Sheets integration
│   └── maps.js        # Google Maps integration
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # Styling
│   └── app.js         # Frontend JavaScript
├── tests/
│   ├── server.test.js # API tests
│   └── services.test.js # Service tests
├── .env.example       # Environment variables template
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Links

- [Live Map](https://www.google.com/maps/d/u/0/edit?mid=1Scfu8Po4sbt9sZB4YWDg-4CUKQcumLPv&usp=sharing)
- [Issue Tracker](https://github.com/1Anastasios1/Like-minded-people---geography/issues)
